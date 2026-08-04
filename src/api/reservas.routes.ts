// Backend de reservas
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { pool, secret } from '../db.js';
import { enviarCorreo } from './utils/mailer.js';
import dotenv from 'dotenv';
import { verificarRecaptcha } from './utils/verificarRecaptcha.js';
import { getStripe, BASE_URL } from './stripe.routes.js';
import { verificarAdmin } from './middleware/verificarAdmin.js';
import { plantillaEmail, filaEmail, importeEmail, porcentajeEmail } from './utils/emailTemplate.js';
import { textosEmail } from './utils/emailTextos.js';

const ESTADOS_RESERVA = ['Pendiente', 'Confirmada', 'Rechazada', 'Cancelada', 'Finalizada'];

// Cambios de estado permitidos. Antes se podía saltar de cualquier estado a cualquier otro, lo que
// permitía combinaciones imposibles (p. ej. reconfirmar una reserva ya reembolsada, que dejaba una
// estancia "Confirmada" que nadie ha pagado). Los estados finales no admiten más cambios.
// Pendiente ya no se cancela a mano: son pagos a medias que limpia el job de reconciliación.
// Hacerlo desde el panel abría un hueco — si el huésped pagaba justo después, el dinero
// entraba en una reserva ya cancelada.
const TRANSICIONES: Record<string, string[]> = {
    'Pendiente': ['Confirmada'],
    'Confirmada': ['Finalizada', 'Cancelada'],
    'Rechazada': [],
    'Cancelada': [],
    'Finalizada': []
};

function formatearFecha(fecha: string | Date): string {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const año = d.getFullYear();
    return `${dia}-${mes}-${año}`;
}

function formatearFechaSQL(fecha: string | Date): string {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const año = d.getFullYear();
    return `${año}-${mes}-${dia}`;
}


dotenv.config();

const router = express.Router();

router.get('/', verificarAdmin, async (req, res) => {
    const estado = req.query['estado'] as string;
    if (estado) {
        if (!ESTADOS_RESERVA.includes(estado)) {
            return res.status(400).json({ error: 'Estado no válido' });
        }

        try {
            const [rows] = await pool.query(
                `SELECT r.*,
                    COALESCE(u.nombre,    r.cliente_nombre)    AS nombre,
                    COALESCE(u.apellidos, r.cliente_apellidos) AS apellidos,
                    COALESCE(u.email,     r.cliente_email)     AS email,
                    COALESCE(u.prefijo,   r.cliente_prefijo)   AS prefijo,
                    COALESCE(u.telefono,  r.cliente_telefono)  AS telefono
                 FROM reservas r
                 LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
                 WHERE r.estado_reserva = ?
                 ORDER BY r.fecha_inicio ASC`,
                [estado]
            );
            return res.json(rows);
        } catch (err) {
            console.error(`[GET /api/reservas/?estado=${estado}]`, err);
            return res.status(500).json({ error: 'Error al obtener reservas por estado' });
        }
    } else {
        try {
            const [rows] = await pool.query(
                `SELECT r.*,
                    COALESCE(u.nombre,    r.cliente_nombre)    AS nombre,
                    COALESCE(u.apellidos, r.cliente_apellidos) AS apellidos,
                    COALESCE(u.email,     r.cliente_email)     AS email,
                    COALESCE(u.prefijo,   r.cliente_prefijo)   AS prefijo,
                    COALESCE(u.telefono,  r.cliente_telefono)  AS telefono
                 FROM reservas r
                 LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
                 ORDER BY r.fecha_inicio ASC`
            );
            return res.json(rows);
        } catch (err) {
            console.error('[GET /api/reservas]', err);
            return res.status(500).json({ error: 'Error al obtener las reservas' });
        }
    }
});


// ---------------------------------------------------------------------------
// Acceso del cliente a su reserva mediante enlace mágico (sin cuenta ni contraseña)
// ---------------------------------------------------------------------------

// Límite simple por IP para que el token no se pueda descubrir por fuerza bruta
const intentosPorIp = new Map<string, { n: number; hasta: number }>();
const LIMITE_INTENTOS = 20;
const VENTANA_MS = 10 * 60 * 1000;

function limiteSuperado(ip: string): boolean {
    const ahora = Date.now();
    const registro = intentosPorIp.get(ip);
    if (!registro || ahora > registro.hasta) {
        intentosPorIp.set(ip, { n: 1, hasta: ahora + VENTANA_MS });
        return false;
    }
    registro.n++;
    return registro.n > LIMITE_INTENTOS;
}

// Gastos de cancelación que se retienen al cancelar. Stripe no devuelve su comisión cuando se
// reembolsa un cobro, así que sin esto el titular la perdería íntegra en cada cancelación.
export function calcularComision(importe: number, pct: any): number {
    const porcentaje = Number(pct) || 0;
    if (porcentaje <= 0) return 0;
    return Math.round(importe * porcentaje) / 100;
}

// Último día, incluido, en que se puede cancelar: la fecha de entrada menos los días de margen.
// Se compara por fecha natural y no por horas fraccionadas porque ahora esta fecha se le muestra
// al huésped: el límite que ve tiene que ser exactamente el que se aplica, y con horas el corte
// se desplazaba según la diferencia horaria al interpretar la fecha de entrada.
export function fechaLimiteCancelacion(fechaInicio: string | Date, diasCancelacion: any): Date {
    const d = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
    const limite = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    limite.setDate(limite.getDate() - (Number(diasCancelacion) || 0));
    return limite;
}

function hoySinHora(): Date {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
}

// Solo los campos que el huésped necesita ver: nada de ids internos ni datos de Stripe
function reservaPublica(r: any) {
    const limiteCancelacion = fechaLimiteCancelacion(r.fecha_inicio, r.dias_cancelacion);
    const cancelable = r.tipo_tarifa === 'cancelable'
        && r.estado_reserva === 'Confirmada'
        && r.estado_pago === 'pagado'
        && hoySinHora() <= limiteCancelacion;

    const base = Number(r.importe_pagado ?? r.precio_total);
    const comision = calcularComision(base, r.comision_cancelacion_pct);

    return {
        nombre: r.cliente_nombre,
        apellidos: r.cliente_apellidos,
        email: r.cliente_email,
        prefijo: r.cliente_prefijo,
        telefono: r.cliente_telefono,
        fecha_inicio: r.fecha_inicio,
        fecha_fin: r.fecha_fin,
        n_personas: r.n_personas,
        bebe: !!r.bebe,
        mascota: !!r.mascota,
        nota_adicional: r.nota_adicional,
        precio_total: r.precio_total,
        importe_pagado: r.importe_pagado,
        tipo_tarifa: r.tipo_tarifa,
        descuento_aplicado: r.descuento_aplicado,
        dias_cancelacion: r.dias_cancelacion,
        // Último día en que se admite la cancelación, incluido. Null en las no cancelables.
        fecha_limite_cancelacion: r.tipo_tarifa === 'cancelable' ? formatearFechaSQL(limiteCancelacion) : null,
        precio_mascota_noche: r.precio_mascota_noche,
        estado_reserva: r.estado_reserva,
        estado_pago: r.estado_pago,
        fecha_creacion: r.fecha_creacion,
        puede_cancelar: cancelable,
        // Desglose de lo que se devolvería si se cancela
        comision_cancelacion_pct: Number(r.comision_cancelacion_pct) || 0,
        comision_cancelacion: comision,
        importe_reembolsable: Math.round((base - comision) * 100) / 100
    };
}

// GET /api/reservas/token/:token — consultar la reserva desde el enlace del email
router.get('/token/:token', async (req, res) => {
    const ip = req.ip || 'desconocida';
    if (limiteSuperado(ip)) {
        return res.status(429).json({ error: 'Demasiados intentos, prueba de nuevo más tarde' });
    }

    const { token } = req.params;
    if (!token || token.length < 32) return res.status(404).json({ error: 'Reserva no encontrada' });

    try {
        const [rows] = await pool.query(`SELECT * FROM reservas WHERE token_acceso = ?`, [token]) as any[];
        if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
        return res.json(reservaPublica(rows[0]));
    } catch (err) {
        console.error('[GET /api/reservas/token/:token]', err);
        return res.status(500).json({ error: 'Error al obtener la reserva' });
    }
});

// POST /api/reservas/token/:token/cancelar — cancelación por el propio huésped
router.post('/token/:token/cancelar', async (req, res) => {
    const ip = req.ip || 'desconocida';
    if (limiteSuperado(ip)) {
        return res.status(429).json({ error: 'Demasiados intentos, prueba de nuevo más tarde' });
    }

    const { token } = req.params;
    if (!token || token.length < 32) return res.status(404).json({ error: 'Reserva no encontrada' });

    try {
        const [rows] = await pool.query(`SELECT * FROM reservas WHERE token_acceso = ?`, [token]) as any[];
        if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });

        const reserva = rows[0];
        const publica = reservaPublica(reserva);
        if (!publica.puede_cancelar) {
            return res.status(400).json({ error: 'Esta reserva ya no se puede cancelar' });
        }

        // Reembolso íntegro antes de tocar el estado: si Stripe falla, no se cancela nada
        const stripe = getStripe();
        if (!stripe || !reserva.stripe_payment_intent_id) {
            return res.status(503).json({ error: 'No se puede procesar el reembolso automáticamente. Contacta con nosotros.' });
        }
        // Se devuelve el importe menos los gastos de cancelación
        const importePagado = Number(reserva.importe_pagado ?? reserva.precio_total);
        const comision = calcularComision(importePagado, reserva.comision_cancelacion_pct);
        const aDevolver = Math.round((importePagado - comision) * 100) / 100;

        try {
            await stripe.refunds.create({
                payment_intent: reserva.stripe_payment_intent_id,
                amount: Math.round(aDevolver * 100)
            });
        } catch (err) {
            console.error('[POST /api/reservas/token/:token/cancelar] Stripe:', err);
            return res.status(500).json({ error: 'No se pudo procesar el reembolso. Contacta con nosotros.' });
        }

        await pool.query(
            `UPDATE reservas SET estado_reserva = 'Cancelada', estado_pago = 'reembolsado' WHERE id_reserva = ?`,
            [reserva.id_reserva]
        );

        // Liberar los días del calendario
        const inicio = new Date(reserva.fecha_inicio);
        const fin = new Date(reserva.fecha_fin);
        const cursor = new Date(inicio);
        while (cursor < fin) {
            await pool.query(
                `UPDATE disponibilidad SET estado = 'disponible', fuente = 'local', id_reserva = NULL
                 WHERE fecha = ? AND id_reserva = ?`,
                [formatearFechaSQL(cursor), reserva.id_reserva]
            );
            cursor.setDate(cursor.getDate() + 1);
        }

        const importe = aDevolver.toFixed(2);
        const fechaInicioFmt = formatearFecha(reserva.fecha_inicio);
        const fechaFinFmt = formatearFecha(reserva.fecha_fin);

        const t = textosEmail(reserva.cliente_idioma);
        await enviarCorreo(reserva.cliente_email, t.asuntoCancelada, plantillaEmail(`
            <h2 style="margin:0 0 8px;font-family:Georgia,serif;color:#3F4B3A;font-size:20px;">${t.hola(reserva.cliente_nombre)}</h2>
            <p style="margin:0 0 20px;color:#555;font-size:15px;">${t.canceladaTexto}</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
                ${filaEmail(t.checkIn, fechaInicioFmt, true)}
                ${filaEmail(t.checkOut, fechaFinFmt)}
                ${comision > 0 ? filaEmail(t.importePagado, importeEmail(importePagado, reserva.cliente_idioma), true) : ''}
                ${comision > 0 ? filaEmail(t.gastosCancelacion(porcentajeEmail(reserva.comision_cancelacion_pct)), `−${importeEmail(comision, reserva.cliente_idioma)}`) : ''}
                ${filaEmail(t.reembolsado, importeEmail(importe, reserva.cliente_idioma), comision <= 0)}
            </table>
            <p style="margin:0 0 16px;color:#555;font-size:15px;">${t.reembolsoTexto(importeEmail(importe, reserva.cliente_idioma))}</p>
            <p style="margin:0;color:#555;font-size:15px;">${t.esperamosVerte}</p>
        `));

        for (const admin of adminEmails) {
            await enviarCorreo(admin, `Reserva cancelada por el cliente — #${reserva.id_reserva}`, plantillaEmail(`
                <h2 style="margin:0 0 8px;font-family:Georgia,serif;color:#3F4B3A;font-size:20px;">Reserva cancelada por el cliente</h2>
                <p style="margin:0 0 20px;color:#555;font-size:15px;">${reserva.cliente_nombre} ${reserva.cliente_apellidos || ''} ha cancelado su reserva desde el enlace de gestión. Los días han vuelto a quedar disponibles.</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    ${filaEmail('Reserva', `#${reserva.id_reserva}`, true)}
                    ${filaEmail('Cliente', `${reserva.cliente_nombre} ${reserva.cliente_apellidos || ''}`)}
                    ${filaEmail('Email', reserva.cliente_email, true)}
                    ${filaEmail('Check-in', fechaInicioFmt)}
                    ${filaEmail('Check-out', fechaFinFmt, true)}
                    ${filaEmail('Reembolsado', `${importe}€`)}
                </table>
            `));
        }

        return res.json({ mensaje: 'Reserva cancelada y reembolsada' });
    } catch (err) {
        console.error('[POST /api/reservas/token/:token/cancelar]', err);
        return res.status(500).json({ error: 'Error al cancelar la reserva' });
    }
});

const adminEmails = ['info@mhtorremolinos.com', 'mhtorremolinos@gmail.com'];

router.post('/', async (req, res) => {
    const token = req.body.recaptcha;
    const esValido = await verificarRecaptcha(token);
    if (!esValido) {
        return res.status(400).json({ error: 'Fallo al verificar reCAPTCHA' });
    }

    // Las condiciones se aceptan en el paso 2. Se comprueba también aquí: si solo lo mirara
    // el navegador, bastaría con lanzar la petición a mano para saltarse la casilla.
    if (req.body.aceptaCondiciones !== true) {
        return res.status(400).json({ error: 'Debes aceptar las condiciones de reserva' });
    }

    const {
        nombre, apellidos, email, telefono, prefijo,
        huespedes, conBebe, conMascota, nota,
        fechaInicio, fechaFin, idioma,
        tipo_tarifa = 'cancelable'
    } = req.body;

    const IDIOMAS = ['es', 'en', 'de', 'no'];
    const clienteIdioma = IDIOMAS.includes(idioma) ? idioma : 'en';

    const fechaInicioFmt = formatearFecha(fechaInicio);
    const fechaFinFmt = formatearFecha(fechaFin);
    const esNoCancelable = tipo_tarifa === 'no_cancelable';

    try {
        // 1. Estancia mínima
        const [[cfgMin]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'min_noches'`) as any[];
        const minNoches = parseInt(cfgMin?.valor || '1', 10);
        const noches = Math.round((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 86400000);
        if (noches < minNoches) {
            return res.status(400).json({ error: `La estancia mínima es de ${minNoches} noches` });
        }

        // 2. Disponibilidad y tarifa: se comprueban en el servidor, nunca se confía en el cliente
        const inicioSQL = formatearFechaSQL(fechaInicio);
        const finSQL = formatearFechaSQL(fechaFin);
        const [diasRows] = await pool.query(
            `SELECT fecha, precio, estado, cancelable FROM disponibilidad WHERE fecha >= ? AND fecha < ? ORDER BY fecha`,
            [inicioSQL, finSQL]
        ) as any[];

        if (diasRows.length !== noches || diasRows.some((d: any) => d.estado !== 'disponible')) {
            return res.status(409).json({ error: 'Las fechas seleccionadas ya no están disponibles' });
        }

        const todosCancelables = diasRows.every((d: any) => d.cancelable !== 0);
        if (!esNoCancelable && !todosCancelables) {
            return res.status(400).json({ error: 'Estas fechas solo admiten la tarifa no cancelable' });
        }

        // Sin cuentas de cliente: la reserva guarda su propio snapshot de datos
        // y se gestiona con el enlace mágico enviado por email.

        // 3. Snapshot de la configuración en el momento de la reserva (para que cambiarla luego
        //    no altere las reservas ya hechas)
        const [[cfgDias]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'dias_cancelacion'`) as any[];
        const [[cfgMascota]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'precio_mascota'`) as any[];
        const [[cfgDescuento]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'descuento_no_cancelable'`) as any[];
        const [[cfgComision]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'comision_cancelacion'`) as any[];

        const diasCancelacion = parseInt(cfgDias?.valor || '30', 10);
        const precioMascotaNoche = parseFloat(cfgMascota?.valor || '10');
        // Se copia el porcentaje vigente: cambiarlo mañana no debe alterar las reservas de hoy
        const comisionPct = parseFloat(cfgComision?.valor) || 0;

        // Si se reserva con menos margen que la ventana de cancelación, esa ventana nace ya
        // cerrada. Cobrar la tarifa flexible ahí sería cobrar de más por un derecho que no llega
        // a existir, así que la reserva pasa a no cancelable y se le aplica su descuento.
        const ventanaCancelacionAbierta = fechaLimiteCancelacion(fechaInicio, diasCancelacion) >= hoySinHora();
        const tarifaFinal = (esNoCancelable || !ventanaCancelacionAbierta) ? 'no_cancelable' : 'cancelable';

        // 4. Precio total, calculado en el servidor a partir de los precios reales de cada día
        const round2 = (n: number) => Math.round(n * 100) / 100;
        const descuentoPct = (tarifaFinal === 'no_cancelable' && todosCancelables) ? (parseFloat(cfgDescuento?.valor) || 0) : 0;
        const precioHabitacion = diasRows.reduce((t: number, d: any) => t + Number(d.precio), 0);
        const descuentoEuros = round2(precioHabitacion * descuentoPct / 100);
        const precioMascotaTotal = conMascota ? noches * precioMascotaNoche : 0;
        const precio_total = round2(precioHabitacion - descuentoEuros + precioMascotaTotal);

        // 5. Insertar la reserva (queda Pendiente hasta que Stripe confirme el pago)
        const tokenAcceso = crypto.randomBytes(32).toString('hex');
        const [insertResult] = await pool.query(
            `INSERT INTO reservas
               (id_usuario, cliente_nombre, cliente_apellidos, cliente_email, cliente_prefijo, cliente_telefono,
                cliente_idioma, fecha_inicio, fecha_fin, n_personas, bebe, mascota, nota_adicional, precio_total,
                tipo_tarifa, descuento_aplicado, comision_cancelacion_pct, dias_cancelacion,
                precio_mascota_noche, estado_pago, token_acceso)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
            [null, nombre, apellidos, email, prefijo, telefono, clienteIdioma,
             fechaInicio, fechaFin, huespedes, conBebe ? 1 : 0, conMascota ? 1 : 0, nota || null,
             precio_total, tarifaFinal, descuentoPct, comisionPct, diasCancelacion,
             precioMascotaNoche, tokenAcceso]
        ) as any[];
        const idReserva = insertResult.insertId;

        // 6. Pago con Stripe: crear la sesión de Checkout y devolver su URL al frontend.
        //    Los emails de confirmación NO se envían aquí, sino desde el webhook cuando el pago cuaja.
        // 6. Pago con Stripe. Es obligatorio: sin pasarela no se acepta la reserva, porque
        //    confirmarla sin cobrar dejaría días bloqueados sin ninguna garantía de pago.
        const stripe = getStripe();
        if (!stripe) {
            console.error('[POST /api/reservas] STRIPE_SECRET_KEY no configurada: no se puede cobrar');
            return res.status(503).json({ error: 'El pago no está disponible en este momento. Inténtalo más tarde o escríbenos.' });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            // Solo tarjeta (Apple Pay, Google Pay y Link van incluidos): se autoriza al momento.
            // Métodos como Klarna, Bancontact o los adeudos SEPA confirman horas o días
            // después, y no queremos dar por buena una reserva cuyo dinero aún no ha llegado.
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{
                quantity: 1,
                price_data: {
                    currency: 'eur',
                    unit_amount: Math.round(precio_total * 100),
                    product_data: {
                        name: `M&H Torremolinos · ${fechaInicioFmt} → ${fechaFinFmt}`,
                        description: `${noches} noches · ${huespedes} huéspedes · Tarifa ${tarifaFinal === 'no_cancelable' ? 'No cancelable' : 'Cancelable'}`
                    }
                }
            }],
            // Stripe genera una factura en PDF, numerada y descargable por el huésped, que además
            // queda archivada en el panel de Stripe. No sustituye a una factura fiscal española
            // (sin NIF ni desglose de IVA), pero sirve como justificante del pago.
            invoice_creation: { enabled: true },
            metadata: { id_reserva: String(idReserva) },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
            success_url: `${BASE_URL}/reservar?pago=ok`,
            cancel_url: `${BASE_URL}/reservar?pago=cancelado`
        });

        await pool.query(
            `UPDATE reservas SET stripe_checkout_session_id = ? WHERE id_reserva = ?`,
            [session.id, idReserva]
        );

        // Los emails de confirmación se envían desde el webhook, cuando el pago se completa.
        // El token viaja en la respuesta, no en success_url: es la credencial de la reserva y en
        // la URL acabaría en el historial y en Analytics en cuanto el visitante acepte cookies.
        return res.status(200).json({ url: session.url, token: tokenAcceso });

    } catch (err) {
        console.error('[POST /api/reservas]', err);
        return res.status(500).json({ error: 'Error interno al procesar la reserva' });
    }
});

// PUT /api/reservas/:id — edición por el administrador.
//
// Qué se puede tocar y qué no:
//   · Datos de contacto, huéspedes, cuna, mascota y notas → libremente.
//   · Fechas → solo si el nuevo rango está libre; se liberan los días viejos y se bloquean
//     los nuevos. El importe ya cobrado NO se recalcula: si hay diferencia se gestiona
//     aparte con un reembolso en Stripe.
//   · Precio y estado del pago → nunca desde aquí, para que la base de datos siempre
//     refleje lo que realmente ocurrió en Stripe.
router.put('/:id', verificarAdmin, async (req, res) => {
    const { id } = req.params;
    const {
        cliente_nombre, cliente_apellidos, cliente_email, cliente_prefijo, cliente_telefono,
        n_personas, bebe, mascota, nota_admin, fecha_inicio, fecha_fin
    } = req.body;

    try {
        const [rows] = await pool.query(`SELECT * FROM reservas WHERE id_reserva = ?`, [id]) as any[];
        if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
        const reserva = rows[0];

        const inicioActual = formatearFechaSQL(reserva.fecha_inicio);
        const finActual = formatearFechaSQL(reserva.fecha_fin);
        const inicioNuevo = fecha_inicio ? formatearFechaSQL(fecha_inicio) : inicioActual;
        const finNuevo = fecha_fin ? formatearFechaSQL(fecha_fin) : finActual;
        const cambianFechas = inicioNuevo !== inicioActual || finNuevo !== finActual;

        if (cambianFechas) {
            const noches = Math.round((new Date(finNuevo).getTime() - new Date(inicioNuevo).getTime()) / 86400000);
            if (noches < 1) return res.status(400).json({ error: 'El rango de fechas no es válido' });

            // El rango nuevo debe estar libre, salvo los días que ya ocupa esta misma reserva
            const [diasRows] = await pool.query(
                `SELECT fecha, estado, id_reserva FROM disponibilidad WHERE fecha >= ? AND fecha < ?`,
                [inicioNuevo, finNuevo]
            ) as any[];

            const ocupado = diasRows.some((d: any) =>
                d.estado !== 'disponible' && String(d.id_reserva) !== String(id));
            if (diasRows.length !== noches || ocupado) {
                return res.status(409).json({ error: 'Las fechas nuevas no están disponibles' });
            }

            // Liberar los días antiguos y bloquear los nuevos
            await pool.query(
                `UPDATE disponibilidad SET estado = 'disponible', fuente = 'local', id_reserva = NULL
                 WHERE id_reserva = ?`,
                [id]
            );
            if (reserva.estado_reserva === 'Confirmada') {
                await pool.query(
                    `UPDATE disponibilidad SET estado = 'reservada', fuente = 'local', id_reserva = ?
                     WHERE fecha >= ? AND fecha < ?`,
                    [id, inicioNuevo, finNuevo]
                );
            }
        }

        await pool.query(
            `UPDATE reservas SET
                cliente_nombre = ?, cliente_apellidos = ?, cliente_email = ?,
                cliente_prefijo = ?, cliente_telefono = ?,
                n_personas = ?, bebe = ?, mascota = ?, nota_admin = ?,
                fecha_inicio = ?, fecha_fin = ?
             WHERE id_reserva = ?`,
            [cliente_nombre ?? reserva.cliente_nombre, cliente_apellidos ?? reserva.cliente_apellidos,
             cliente_email ?? reserva.cliente_email, cliente_prefijo ?? reserva.cliente_prefijo,
             cliente_telefono ?? reserva.cliente_telefono,
             n_personas ?? reserva.n_personas, bebe ? 1 : 0, mascota ? 1 : 0,
             nota_admin ?? reserva.nota_admin, inicioNuevo, finNuevo, id]
        );

        return res.json({ mensaje: 'Reserva actualizada', fechasCambiadas: cambianFechas });
    } catch (err) {
        console.error('[PUT /api/reservas/:id]', err);
        return res.status(500).json({ error: 'Error al actualizar la reserva' });
    }
});

// POST /api/reservas/:id/reenviar-confirmacion — vuelve a mandar el email con el enlace de gestión
router.post('/:id/reenviar-confirmacion', verificarAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`SELECT * FROM reservas WHERE id_reserva = ?`, [id]) as any[];
        if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
        const r = rows[0];

        const t = textosEmail(r.cliente_idioma);
        await enviarCorreo(r.cliente_email, t.asuntoDatos, plantillaEmail(`
            <h2 style="margin:0 0 8px;font-family:Georgia,serif;color:#3F4B3A;font-size:20px;">${t.hola(r.cliente_nombre)}</h2>
            <p style="margin:0 0 20px;color:#555;font-size:15px;">${t.datosIntro}</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
                ${filaEmail(t.checkIn, formatearFecha(r.fecha_inicio), true)}
                ${filaEmail(t.checkOut, formatearFecha(r.fecha_fin))}
                ${filaEmail(t.huespedes, String(r.n_personas), true)}
                ${filaEmail(t.total, importeEmail(r.precio_total, r.cliente_idioma))}
            </table>
            <div style="text-align:center;margin:28px 0 8px;">
              <a href="${BASE_URL}/reserva/${r.token_acceso}" style="display:inline-block;background:#3F4B3A;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;">${t.verReserva}</a>
              <p style="margin:10px 0 0;font-size:12px;color:#999;">${t.guardaEmail}</p>
            </div>
        `));

        return res.json({ mensaje: 'Email reenviado' });
    } catch (err) {
        console.error('[POST /api/reservas/:id/reenviar-confirmacion]', err);
        return res.status(500).json({ error: 'Error al reenviar el email' });
    }
});

router.put('/:id/estado', verificarAdmin, async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!ESTADOS_RESERVA.includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido' });
    }

    try {
        // 1. Obtener datos de la reserva
        const [rows] = await pool.query(`
            SELECT r.*,
                COALESCE(u.nombre,    r.cliente_nombre)    AS nombre,
                COALESCE(u.apellidos, r.cliente_apellidos) AS apellidos,
                COALESCE(u.email,     r.cliente_email)     AS email
            FROM reservas r
            LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
            WHERE r.id_reserva = ?
        `, [id]) as any[];

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const reserva = rows[0];
        const fechaInicio = new Date(reserva.fecha_inicio);
        const fechaFin = new Date(reserva.fecha_fin);
        const nombre = reserva.nombre;
        const apellidos = reserva.apellidos;
        const email = reserva.email;

        // 2. El cambio pedido tiene que ser legal desde el estado actual
        if (reserva.estado_reserva === estado) {
            return res.status(400).json({ error: `La reserva ya está en estado ${estado}` });
        }
        const permitidos = TRANSICIONES[reserva.estado_reserva] || [];
        if (!permitidos.includes(estado)) {
            return res.status(400).json({
                error: `No se puede pasar de ${reserva.estado_reserva} a ${estado}`
            });
        }
        if (estado === 'Finalizada' && new Date(reserva.fecha_fin) > new Date()) {
            return res.status(400).json({ error: 'La estancia todavía no ha terminado' });
        }

        const generarDiasArray = (inicio: Date, fin: Date) => {
            const dias = [];
            const actual = new Date(inicio);
            while (actual < fin) {
                dias.push(formatearFechaSQL(new Date(actual)));
                actual.setDate(actual.getDate() + 1);
            }
            return dias;
        };
        const dias = generarDiasArray(fechaInicio, fechaFin);

        // 3. Al confirmar: comprobar la disponibilidad ANTES de tocar nada.
        //    Si se guardaba el estado primero, un fallo aquí dejaba la reserva "Confirmada"
        //    con los días sin bloquear: vendida en la lista y libre en el calendario.
        if (estado === 'Confirmada') {
            const placeholders = dias.map(() => '?').join(',');
            const [disponibles] = await pool.query(`
                SELECT id_disponibilidad FROM disponibilidad
                WHERE fecha IN (${placeholders}) AND estado = 'disponible'
            `, dias) as any[];

            if (disponibles.length !== dias.length) {
                return res.status(409).json({ error: 'Uno o más días ya no están disponibles' });
            }
        }

        // 4. Reembolso en Stripe antes de cambiar el estado: si Stripe falla, no se toca la reserva
        let reembolsado = false;
        let importeDevuelto = 0;
        if (['Rechazada', 'Cancelada'].includes(estado) && reserva.estado_pago === 'pagado' && reserva.stripe_payment_intent_id) {
            const stripe = getStripe();
            if (!stripe) {
                return res.status(503).json({ error: 'No se puede reembolsar: Stripe no está configurado' });
            }
            const pagado = Number(reserva.importe_pagado ?? reserva.precio_total);
            importeDevuelto = Math.round((pagado - calcularComision(pagado, reserva.comision_cancelacion_pct)) * 100) / 100;
            try {
                await stripe.refunds.create({
                    payment_intent: reserva.stripe_payment_intent_id,
                    amount: Math.round(importeDevuelto * 100)
                });
                await pool.query(`UPDATE reservas SET estado_pago = 'reembolsado' WHERE id_reserva = ?`, [id]);
                reembolsado = true;
            } catch (err) {
                console.error('[PUT /api/reservas/:id/estado] error al reembolsar:', err);
                return res.status(500).json({ error: 'Error al reembolsar el pago en Stripe. El estado no se ha cambiado.' });
            }
        }

        // 5. Ya es seguro guardar el estado
        await pool.query(`UPDATE reservas SET estado_reserva = ? WHERE id_reserva = ?`, [estado, id]);

        // 6. Al confirmar: bloquear los días y avisar al cliente
        if (estado === 'Confirmada') {
            for (const fecha of dias) {
                await pool.query(`
                    UPDATE disponibilidad
                    SET estado = 'reservada', fuente = 'local', id_reserva = ?
                    WHERE fecha = ? AND estado = 'disponible'
                `, [id, fecha]);
            }

            // 3.3 Email al cliente
            const fechaInicioFmt = formatearFecha(fechaInicio);
            const fechaFinFmt = formatearFecha(fechaFin);

            const tc = textosEmail(reserva.cliente_idioma);
            await enviarCorreo(email, tc.asuntoConfirmada, plantillaEmail(`
                <div style="text-align:center;">
                  <div style="font-size:48px;">✓</div>
                  <h2 style="margin:8px 0 4px;font-family:Georgia,serif;color:#3F4B3A;font-size:22px;">${tc.confirmadaTitulo}</h2>
                  <p style="margin:0 0 28px;color:#555;font-size:15px;">${tc.hola(nombre)} ${tc.confirmadaIntro}</p>
                </div>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    ${filaEmail(tc.checkIn, fechaInicioFmt, true)}
                    ${filaEmail(tc.checkOut, fechaFinFmt)}
                </table>
                <div style="text-align:center;margin:28px 0 8px;">
                  <a href="${BASE_URL}/reserva/${reserva.token_acceso}" style="display:inline-block;background:#3F4B3A;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:15px;">${tc.verReserva}</a>
                  <p style="margin:10px 0 0;font-size:12px;color:#999;">${tc.guardaEmail}</p>
                </div>
                <p style="font-size:14px;color:#555;margin:24px 0 0;">${tc.dudas} <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;">info@mhtorremolinos.com</a>. <em>${tc.hastaPronto}</em></p>
            `));
        }

        if (['Rechazada', 'Cancelada'].includes(estado)) {
            for (const fecha of dias) {
                await pool.query(`
                    UPDATE disponibilidad
                    SET estado = 'disponible', fuente = 'local', id_reserva = NULL
                    WHERE fecha = ? AND id_reserva = ?
                `, [fecha, id]);
            }

            // 'Rechazada' ya no es alcanzable (ver TRANSICIONES), así que aquí solo llegan cancelaciones
            const t = textosEmail(reserva.cliente_idioma);
            const importe = importeDevuelto.toFixed(2);
            const pagadoAdmin = Number(reserva.importe_pagado ?? reserva.precio_total) || 0;
            const comisionAdmin = reembolsado ? calcularComision(pagadoAdmin, reserva.comision_cancelacion_pct) : 0;

            await enviarCorreo(email, t.asuntoCancelada, plantillaEmail(`
                <h2 style="margin:0 0 8px;font-family:Georgia,serif;color:#3F4B3A;font-size:20px;">${t.hola(nombre)}</h2>
                <p style="margin:0 0 20px;color:#555;font-size:15px;">${t.canceladaTexto}</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
                    ${filaEmail(t.checkIn, formatearFecha(fechaInicio), true)}
                    ${filaEmail(t.checkOut, formatearFecha(fechaFin))}
                    ${reembolsado && comisionAdmin > 0 ? filaEmail(t.importePagado, importeEmail(pagadoAdmin, reserva.cliente_idioma), true) : ''}
                    ${reembolsado && comisionAdmin > 0 ? filaEmail(t.gastosCancelacion(porcentajeEmail(reserva.comision_cancelacion_pct)), `−${importeEmail(comisionAdmin, reserva.cliente_idioma)}`) : ''}
                    ${reembolsado ? filaEmail(t.reembolsado, importeEmail(importe, reserva.cliente_idioma), comisionAdmin <= 0) : ''}
                </table>
                ${reembolsado ? `<p style="margin:0 0 16px;color:#555;font-size:15px;">${t.reembolsoTexto(importe)}</p>` : ''}
                <p style="margin:0 0 8px;color:#555;font-size:15px;">${t.esperamosVerte}</p>
                <p style="font-size:14px;color:#555;margin:0;">${t.dudas} <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;">info@mhtorremolinos.com</a>.</p>
            `));
        }

        return res.json({ mensaje: 'Estado actualizado correctamente' });
    } catch (err) {
        console.error('[PUT /api/reservas/:id/estado]', err);
        return res.status(500).json({ error: 'Error al actualizar el estado de la reserva' });
    }
});

export default router;
