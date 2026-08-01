// Integración con Stripe: configuración, webhook de pagos y emails de confirmación.
// Si STRIPE_SECRET_KEY no está definida, el sistema funciona en modo transferencia (flujo antiguo).
import express from 'express';
import Stripe from 'stripe';
import { pool } from '../db.js';
import { enviarCorreo } from './utils/mailer.js';

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

function plantillaEmail(contenido: string): string {
    return `
    <body style="margin:0;padding:0;background:#f4f4f0;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;max-width:600px;width:100%;">
            <tr><td style="background:#3F4B3A;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;font-family:Georgia,serif;color:#ffffff;font-size:22px;letter-spacing:1px;">M&amp;H Torremolinos</h1>
              <p style="margin:6px 0 0;color:#b8c4b3;font-size:13px;">Calle Loma de los Riscos 117 · Torremolinos, Málaga</p>
            </td></tr>
            <tr><td style="padding:36px 40px;">${contenido}</td></tr>
            <tr><td style="background:#f5f8f3;padding:20px 40px;text-align:center;border-top:1px solid #e0e0d8;">
              <p style="margin:0;font-size:13px;color:#888;">M&amp;H Torremolinos · <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;text-decoration:none;">info@mhtorremolinos.com</a></p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>`;
}

// GET /api/stripe/config — indica al frontend si el pago con Stripe está activo
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

    // Idempotencia: si la reserva ya no está pendiente, el evento ya fue procesado
    if (reserva.estado_reserva !== 'Pendiente') return;

    const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id || null;
    const importePagado = (session.amount_total ?? 0) / 100;

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
                stripe_checkout_session_id = ?, stripe_payment_intent_id = ?, importe_pagado = ?
             WHERE id_reserva = ?`,
            [session.id, paymentIntentId, importePagado, idReserva]
        );

        await enviarCorreo(email, 'Booking could not be completed — M&H Torremolinos', plantillaEmail(`
            <h2 style="margin:0 0 8px;font-family:Georgia,serif;color:#3F4B3A;font-size:20px;">Hi ${nombre},</h2>
            <p style="margin:0 0 16px;color:#555;font-size:15px;">Unfortunately, the dates you selected (${fechaInicioFmt} → ${fechaFinFmt}) were booked by another guest while your payment was being processed.</p>
            <p style="margin:0 0 16px;color:#555;font-size:15px;"><strong>Your payment of ${importePagado.toFixed(2)}€ has been refunded in full</strong> to your original payment method. Depending on your bank, it may take a few days to appear.</p>
            <p style="margin:0;color:#555;font-size:15px;">We would love to host you on different dates — check our availability at <a href="${BASE_URL}/reservar" style="color:#3F4B3A;">mhtorremolinos.com</a>.</p>
        `));

        for (const admin of adminEmails) {
            await enviarCorreo(admin, `Conflicto de reserva reembolsado — #${idReserva}`, plantillaEmail(`
                <p style="margin:0;color:#555;font-size:15px;">La reserva #${idReserva} (${nombre}, ${fechaInicioFmt} → ${fechaFinFmt}) se pagó pero las fechas ya no estaban disponibles. Se ha reembolsado automáticamente ${importePagado.toFixed(2)}€.</p>
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

    const esNoCancelable = reserva.tipo_tarifa === 'no_cancelable';
    const politicaCancelacion = esNoCancelable
        ? `<p style="margin:12px 0 0;font-size:13px;color:#8f0000;">⚠ Non-refundable rate: this booking cannot be cancelled or refunded.</p>`
        : `<p style="margin:12px 0 0;font-size:13px;color:#3F4B3A;">✓ Free cancellation up to ${reserva.dias_cancelacion} days before check-in — full refund.</p>`;

    await enviarCorreo(email, 'Booking confirmed — M&H Torremolinos', plantillaEmail(`
        <div style="text-align:center;">
          <div style="font-size:48px;">✓</div>
          <h2 style="margin:8px 0 4px;font-family:Georgia,serif;color:#3F4B3A;font-size:22px;">Your booking is confirmed!</h2>
          <p style="margin:0 0 28px;color:#555;font-size:15px;">Hi ${nombre}, thank you for your payment — we are delighted to welcome you.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="background:#f5f8f3;">
            <td style="padding:12px 16px;color:#555;">Check-in</td>
            <td style="padding:12px 16px;font-weight:700;text-align:right;">${fechaInicioFmt}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#555;">Check-out</td>
            <td style="padding:12px 16px;font-weight:700;text-align:right;">${fechaFinFmt}</td>
          </tr>
          <tr style="background:#f5f8f3;">
            <td style="padding:12px 16px;color:#555;">Guests</td>
            <td style="padding:12px 16px;font-weight:700;text-align:right;">${reserva.n_personas}</td>
          </tr>
          <tr style="border-top:2px solid #3F4B3A;">
            <td style="padding:12px 16px;color:#3F4B3A;font-weight:700;">Paid</td>
            <td style="padding:12px 16px;font-weight:700;text-align:right;font-size:17px;">${importePagado.toFixed(2)}€</td>
          </tr>
        </table>
        ${politicaCancelacion}
        <p style="font-size:14px;color:#555;margin:24px 0 0;">If you have any questions before your arrival, contact us at <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;">info@mhtorremolinos.com</a>. <em>We look forward to seeing you soon!</em></p>
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
              <tr><td style="padding:10px 14px;color:#555;">Pagado</td><td style="padding:10px 14px;font-weight:700;font-size:16px;color:#2d6a00;">${importePagado.toFixed(2)}€</td></tr>
              ${reserva.nota_adicional ? `<tr style="background:#f5f8f3;"><td style="padding:10px 14px;color:#555;vertical-align:top;">Nota</td><td style="padding:10px 14px;">${reserva.nota_adicional}</td></tr>` : ''}
            </table>
            <p style="text-align:center;margin:20px 0 0;"><a href="${BASE_URL}/admin" style="display:inline-block;background:#3F4B3A;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;">Abrir panel de administración</a></p>
        `));
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
