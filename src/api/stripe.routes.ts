// Integración con Stripe: webhook de pagos, reconciliación y emails de confirmación.
// El pago con tarjeta es obligatorio: sin STRIPE_SECRET_KEY no se pueden aceptar reservas.
import express from 'express';
import Stripe from 'stripe';
import { pool } from '../db.js';
import { enviarCorreo } from './utils/mailer.js';
import { plantillaEmail, filaEmail, importeEmail } from './utils/emailTemplate.js';
import { textosEmail } from './utils/emailTextos.js';

const router = express.Router();

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
    const key = process.env['STRIPE_SECRET_KEY'];
    if (!key) return null;
    if (!stripeClient) stripeClient = new Stripe(key);
    return stripeClient;
}

export const BASE_URL = process.env['BASE_URL'] || 'https://www.mhtorremolinos.com';

const adminEmails = ['info@mhtorremolinos.com', 'mhtorremolinos@gmail.com'];

function formatearFecha(fecha: string | Date): string {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const año = d.getFullYear();
    return `${dia}-${mes}-${año}`;
}

function formatearFechaSQL(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${año}-${mes}-${dia}`;
}

function generarDiasArray(inicio: Date, fin: Date): string[] {
    const dias = [];
    const actual = new Date(inicio);
    while (actual < fin) {
        dias.push(formatearFechaSQL(new Date(actual)));
        actual.setDate(actual.getDate() + 1);
    }
    return dias;
}

// GET /api/stripe/config — comprobación de que la pasarela está configurada (diagnóstico)
router.get('/config', (_req, res) => {
    res.json({ activo: !!process.env['STRIPE_SECRET_KEY'] });
});

// POST /api/stripe/webhook — eventos de Stripe (body en crudo para verificar la firma)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const stripe = getStripe();
    const whsec = process.env['STRIPE_WEBHOOK_SECRET'];
    if (!stripe || !whsec) return res.status(503).send('Stripe no configurado');

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'] as string, whsec);
    } catch (err: any) {
        console.error('[stripe webhook] firma inválida:', err.message);
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    try {
        if (event.type === 'checkout.session.completed') {
            await procesarPagoCompletado(stripe, event.data.object as Stripe.Checkout.Session);
        } else if (event.type === 'checkout.session.expired') {
            await procesarSesionExpirada(event.data.object as Stripe.Checkout.Session);
        }
        return res.json({ received: true });
    } catch (err) {
        console.error('[stripe webhook]', err);
        return res.status(500).json({ error: 'Error interno al procesar el evento' });
    }
});

async function procesarPagoCompletado(stripe: Stripe, session: Stripe.Checkout.Session): Promise<void> {
    const idReserva = parseInt(session.metadata?.['id_reserva'] || '0', 10);
    if (!idReserva) return;

    const [rows] = await pool.query(`SELECT * FROM reservas WHERE id_reserva = ?`, [idReserva]) as any[];
    if (rows.length === 0) return;
    const reserva = rows[0];

    // El evento puede llegar con el pago aún sin cobrar. Solo se confirma con el dinero dentro.
    if (session.payment_status !== 'paid') {
        console.warn(`[stripe] sesión ${session.id} completada pero payment_status=${session.payment_status}; no se confirma la reserva #${idReserva}`);
        return;
    }

    // La reserva ya no está pendiente. O bien el evento es un reintento de Stripe sobre algo ya
    // procesado (no hay que hacer nada), o bien ha entrado dinero de una reserva que ya no se puede
    // honrar: se cancelaron los días entre medias. En ese caso hay que devolverlo, nunca ignorarlo.
    if (reserva.estado_reserva !== 'Pendiente') {
        const yaCobrada = reserva.estado_pago === 'pagado' || reserva.estado_pago === 'reembolsado';
        if (yaCobrada) return; // reintento de un evento ya procesado

        const piId = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null;

        console.warn(`[stripe] pago recibido para la reserva #${idReserva}, que está ${reserva.estado_reserva}. Se reembolsa.`);
        if (piId) {
            try {
                await stripe.refunds.create({ payment_intent: piId });
                await pool.query(
                    `UPDATE reservas SET estado_pago = 'reembolsado', stripe_payment_intent_id = ?, importe_pagado = ?,
                        comision_cancelacion_pct = 0
                     WHERE id_reserva = ?`,
                    [piId, (session.amount_total ?? 0) / 100, idReserva]
                );
            } catch (err) {
                console.error(`[stripe] no se pudo reembolsar el pago huérfano de la reserva #${idReserva}:`, err);
            }
        }

        for (const admin of adminEmails) {
            await enviarCorreo(admin, `Pago recibido de una reserva ${reserva.estado_reserva} — #${idReserva}`, plantillaEmail(`
                <p style="margin:0 0 12px;color:#555;font-size:15px;">Ha entrado un pago de <strong>${importeEmail((session.amount_total ?? 0) / 100, 'es')}</strong> para la reserva #${idReserva}, que ya estaba en estado <strong>${reserva.estado_reserva}</strong>.</p>
                <p style="margin:0;color:#555;font-size:15px;">Se ha reembolsado automáticamente. Conviene revisarlo en el panel de Stripe.</p>
            `));
        }
        return;
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null;
    const importePagado = (session.amount_total ?? 0) / 100;

    // País del cliente: dirección de facturación y, si Stripe no la pidió, país emisor de la tarjeta.
    // Nunca debe impedir la confirmación de la reserva.
    // De paso se guarda la comisión real de Stripe: no interviene en el reembolso (que usa el
    // porcentaje pactado) pero permite comprobar si ese porcentaje cubre el coste real.
    let paisCliente: string | null = session.customer_details?.address?.country ?? null;
    let comisionReal: number | null = null;
    if (paymentIntentId) {
        try {
            const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
                expand: ['latest_charge.balance_transaction']
            });
            const charge: any = pi.latest_charge;
            paisCliente = paisCliente ?? charge?.payment_method_details?.card?.country ?? null;
            const bt = charge?.balance_transaction;
            if (bt && typeof bt.fee === 'number') comisionReal = bt.fee / 100;
        } catch (err) {
            console.warn('[stripe webhook] no se pudieron leer los datos del cobro:', err);
        }
    }
    if (paisCliente || comisionReal !== null) {
        await pool.query(
            `UPDATE reservas SET cliente_pais = COALESCE(?, cliente_pais), comision_stripe = COALESCE(?, comision_stripe)
             WHERE id_reserva = ?`,
            [paisCliente, comisionReal, idReserva]
        );
    }

    const nombre = reserva.cliente_nombre;
    const email = reserva.cliente_email;
    const fechaInicioFmt = formatearFecha(reserva.fecha_inicio);
    const fechaFinFmt = formatearFecha(reserva.fecha_fin);
    const dias = generarDiasArray(new Date(reserva.fecha_inicio), new Date(reserva.fecha_fin));

    // Verificar que los días siguen disponibles (otro cliente pudo reservar mientras pagaba)
    const placeholders = dias.map(() => '?').join(',');
    const [disponibles] = await pool.query(
        `SELECT id_disponibilidad FROM disponibilidad WHERE fecha IN (${placeholders}) AND estado = 'disponible'`,
        dias
    ) as any[];

    if (disponibles.length !== dias.length) {
        // Conflicto: reembolso automático
        if (paymentIntentId) {
            await stripe.refunds.create({ payment_intent: paymentIntentId });
        }
        await pool.query(
            `UPDATE reservas SET estado_reserva = 'Cancelada', estado_pago = 'reembolsado',
                comision_cancelacion_pct = 0,
                stripe_checkout_session_id = ?, stripe_payment_intent_id = ?, importe_pagado = ?
             WHERE id_reserva = ?`,
            [session.id, paymentIntentId, importePagado, idReserva]
        );

        const t = textosEmail(reserva.cliente_idioma);
        await enviarCorreo(email, t.asuntoConflicto, plantillaEmail(`
            <h2 style="margin:0 0 8px;font-family:Georgia,serif;color:#3F4B3A;font-size:20px;">${t.hola(nombre)}</h2>
            <p style="margin:0 0 16px;color:#555;font-size:15px;">${t.conflictoTexto(fechaInicioFmt, fechaFinFmt)}</p>
            <p style="margin:0 0 16px;color:#555;font-size:15px;">${t.conflictoReembolso(importePagado.toFixed(2))}</p>
            <p style="margin:0;color:#555;font-size:15px;">${t.conflictoOtrasFechas} <a href="${BASE_URL}/reservar" style="color:#3F4B3A;">mhtorremolinos.com</a>.</p>
        `));

        for (const admin of adminEmails) {
            await enviarCorreo(admin, `Conflicto de reserva reembolsado — #${idReserva}`, plantillaEmail(`
                <p style="margin:0;color:#555;font-size:15px;">La reserva #${idReserva} (${nombre}, ${fechaInicioFmt} → ${fechaFinFmt}) se pagó pero las fechas ya no estaban disponibles. Se ha reembolsado automáticamente ${importeEmail(importePagado, 'es')}.</p>
            `));
        }
        return;
    }

    // Confirmar: marcar días como reservados y actualizar la reserva
    for (const fecha of dias) {
        await pool.query(
            `UPDATE disponibilidad SET estado = 'reservada', fuente = 'local', id_reserva = ? WHERE fecha = ? AND estado = 'disponible'`,
            [idReserva, fecha]
        );
    }

    await pool.query(
        `UPDATE reservas SET estado_reserva = 'Confirmada', estado_pago = 'pagado',
            stripe_checkout_session_id = ?, stripe_payment_intent_id = ?, importe_pagado = ?
         WHERE id_reserva = ?`,
        [session.id, paymentIntentId, importePagado, idReserva]
    );

    const [[cfgIn]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'hora_checkin'`) as any[];
    const [[cfgOut]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'hora_checkout'`) as any[];
    const horaCheckin = cfgIn?.valor || '16:00';
    const horaCheckout = cfgOut?.valor || '11:00';

    const esNoCancelable = reserva.tipo_tarifa === 'no_cancelable';
    const t = textosEmail(reserva.cliente_idioma);

    const politicaCancelacion = esNoCancelable
        ? `<p style="margin:12px 0 0;font-size:13px;color:#8f0000;">${t.politicaNoCancelable}</p>`
        : `<p style="margin:12px 0 0;font-size:13px;color:#3F4B3A;">${t.politicaCancelable(reserva.dias_cancelacion)}</p>`;

    await enviarCorreo(email, t.asuntoConfirmada, plantillaEmail(`
        <div style="text-align:center;">
          <div style="font-size:48px;">✓</div>
          <h2 style="margin:8px 0 4px;font-family:Georgia,serif;color:#3F4B3A;font-size:22px;">${t.confirmadaTitulo}</h2>
          <p style="margin:0 0 28px;color:#555;font-size:15px;">${t.hola(nombre)} ${t.confirmadaIntro}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${filaEmail(t.checkIn, `${fechaInicioFmt} · ${t.desdeHora(horaCheckin)}`, true)}
          ${filaEmail(t.checkOut, `${fechaFinFmt} · ${t.antesHora(horaCheckout)}`)}
          ${filaEmail(t.huespedes, String(reserva.n_personas), true)}
          <tr style="border-top:2px solid #3F4B3A;">
            <td style="padding:12px 16px;color:#3F4B3A;font-weight:700;">${t.pagado}</td>
            <td style="padding:12px 16px;font-weight:700;text-align:right;font-size:17px;">${importeEmail(importePagado, reserva.cliente_idioma)}</td>
          </tr>
        </table>
        ${politicaCancelacion}
        <div style="text-align:center;margin:28px 0 8px;">
          <a href="${BASE_URL}/reserva/${reserva.token_acceso}" style="display:inline-block;background:#3F4B3A;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;">${t.verReserva}</a>
          <p style="margin:10px 0 0;font-size:12px;color:#999;">${t.guardaEmail}</p>
        </div>
        <p style="font-size:14px;color:#555;margin:24px 0 0;">${t.dudas} <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;">info@mhtorremolinos.com</a>. <em>${t.hastaPronto}</em></p>
    `));

    for (const admin of adminEmails) {
        await enviarCorreo(admin, `Nueva reserva pagada — ${nombre} (${fechaInicioFmt})`, plantillaEmail(`
            <h2 style="margin:0 0 16px;font-family:Georgia,serif;color:#3F4B3A;font-size:18px;">Nueva reserva confirmada y pagada</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr style="background:#f5f8f3;"><td style="padding:10px 14px;color:#555;width:45%;">Cliente</td><td style="padding:10px 14px;font-weight:700;">${nombre} ${reserva.cliente_apellidos || ''}</td></tr>
              <tr><td style="padding:10px 14px;color:#555;">Email</td><td style="padding:10px 14px;"><a href="mailto:${email}" style="color:#3F4B3A;">${email}</a></td></tr>
              <tr style="background:#f5f8f3;"><td style="padding:10px 14px;color:#555;">Teléfono</td><td style="padding:10px 14px;">${reserva.cliente_prefijo || ''} ${reserva.cliente_telefono || ''}</td></tr>
              <tr><td style="padding:10px 14px;color:#555;">Check-in</td><td style="padding:10px 14px;font-weight:700;">${fechaInicioFmt}</td></tr>
              <tr style="background:#f5f8f3;"><td style="padding:10px 14px;color:#555;">Check-out</td><td style="padding:10px 14px;font-weight:700;">${fechaFinFmt}</td></tr>
              <tr><td style="padding:10px 14px;color:#555;">Huéspedes</td><td style="padding:10px 14px;">${reserva.n_personas}${reserva.bebe ? ' · cuna' : ''}${reserva.mascota ? ' · mascota' : ''}</td></tr>
              <tr style="background:#f5f8f3;"><td style="padding:10px 14px;color:#555;">Tarifa</td><td style="padding:10px 14px;">${esNoCancelable ? 'No cancelable' : 'Cancelable'}</td></tr>
              <tr><td style="padding:10px 14px;color:#555;">Pagado</td><td style="padding:10px 14px;font-weight:700;font-size:16px;color:#2d6a00;">${importeEmail(importePagado, 'es')}</td></tr>
              ${reserva.nota_adicional ? `<tr style="background:#f5f8f3;"><td style="padding:10px 14px;color:#555;vertical-align:top;">Nota</td><td style="padding:10px 14px;">${reserva.nota_adicional}</td></tr>` : ''}
            </table>
            <p style="text-align:center;margin:20px 0 0;"><a href="${BASE_URL}/admin" style="display:inline-block;background:#3F4B3A;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;">Abrir panel de administración</a></p>
        `));
    }
}

// Red de seguridad por si el servidor estaba caído cuando Stripe envió el webhook.
// Para cada reserva que sigue pendiente se le pregunta a Stripe cuál es la verdad:
//   pagada  -> se confirma como habría hecho el webhook (procesarPagoCompletado es idempotente)
//   expirada -> se cancela
//   abierta  -> se deja, el cliente todavía puede estar pagando
export async function reconciliarReservasPendientes(): Promise<void> {
    const stripe = getStripe();
    if (!stripe) return;

    try {
        const [rows] = await pool.query(
            `SELECT id_reserva, stripe_checkout_session_id FROM reservas
             WHERE estado_reserva = 'Pendiente' AND estado_pago = 'pendiente'
               AND stripe_checkout_session_id IS NOT NULL
               AND fecha_creacion < (NOW() - INTERVAL 30 MINUTE)`
        ) as any[];

        if (rows.length === 0) return;
        console.log(`[reconciliación] revisando ${rows.length} reserva(s) pendientes en Stripe`);

        for (const fila of rows) {
            try {
                const session = await stripe.checkout.sessions.retrieve(fila.stripe_checkout_session_id);

                if (session.payment_status === 'paid') {
                    console.log(`[reconciliación] la reserva #${fila.id_reserva} sí estaba pagada, confirmando`);
                    await procesarPagoCompletado(stripe, session);
                } else if (session.status === 'expired') {
                    await procesarSesionExpirada(session);
                    console.log(`[reconciliación] reserva #${fila.id_reserva} cancelada (sesión expirada)`);
                }
            } catch (err) {
                console.error(`[reconciliación] error con la reserva #${fila.id_reserva}:`, err);
            }
        }
    } catch (err) {
        console.error('[reconciliación] error general:', err);
    }
}

async function procesarSesionExpirada(session: Stripe.Checkout.Session): Promise<void> {
    const idReserva = parseInt(session.metadata?.['id_reserva'] || '0', 10);
    if (!idReserva) return;
    // Solo cancelar si sigue pendiente de pago
    await pool.query(
        `UPDATE reservas SET estado_reserva = 'Cancelada' WHERE id_reserva = ? AND estado_reserva = 'Pendiente' AND estado_pago = 'pendiente'`,
        [idReserva]
    );
}

export default router;
