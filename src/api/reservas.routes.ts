// Backend de reservas
import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { pool, secret } from '../db.js';
import { enviarCorreo } from './utils/mailer.js';
import dotenv from 'dotenv';
import { verificarRecaptcha } from './utils/verificarRecaptcha.js';
import { crearUsuario } from './utils/usuarios.js';
import { getStripe, BASE_URL } from './stripe.routes.js';
import { verificarAdmin } from './middleware/verificarAdmin.js';

const ESTADOS_RESERVA = ['Pendiente', 'Confirmada', 'Rechazada', 'Cancelada', 'Finalizada'];

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


router.get('/cliente', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

    try {
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, secret!) as any;
        const id_usuario = payload.id;

        const [rows] = await pool.query(
            `SELECT r.*,
                COALESCE(u.nombre,    r.cliente_nombre)    AS nombre,
                COALESCE(u.apellidos, r.cliente_apellidos) AS apellidos,
                COALESCE(u.email,     r.cliente_email)     AS email,
                COALESCE(u.prefijo,   r.cliente_prefijo)   AS prefijo,
                COALESCE(u.telefono,  r.cliente_telefono)  AS telefono
             FROM reservas r
             LEFT JOIN usuarios u ON r.id_usuario = u.id_usuario
             WHERE r.id_usuario = ?
             ORDER BY r.fecha_inicio ASC`,
            [id_usuario]
        );

        return res.json(rows);
    } catch (err) {
        console.error('[GET /api/reservas/cliente]', err);
        return res.status(500).json({ error: 'Error al obtener tus reservas' });
    }
});


// Configuración desde .env
const IBAN = process.env['RESERVA_IBAN'] || 'IBAN_NO_CONFIGURADO';
const adminEmails = ['info@mhtorremolinos.com', 'mhtorremolinos@gmail.com'];

router.post('/', async (req, res) => {
    const token = req.body.recaptcha;
    const esValido = await verificarRecaptcha(token);
    if (!esValido) {
        return res.status(400).json({ error: 'Fallo al verificar reCAPTCHA' });
    }

    const {
        nombre, apellidos, email, telefono, prefijo,
        huespedes, conBebe, conMascota, nota,
        fechaInicio, fechaFin,
        tipo_tarifa = 'cancelable'
    } = req.body;

    const fechaInicioFmt = formatearFecha(fechaInicio);
    const fechaFinFmt = formatearFecha(fechaFin);
    const esNoCancelable = tipo_tarifa === 'no_cancelable';
    const labelTarifa = esNoCancelable ? 'No cancelable' : 'Cancelable';

    let id_usuario = null;

    try {
        // 0. Estancia mínima
        const [[cfgMin]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'min_noches'`) as any[];
        const minNoches = parseInt(cfgMin?.valor || '1', 10);
        const noches = Math.round((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 86400000);
        if (noches < minNoches) {
            return res.status(400).json({ error: `La estancia mínima es de ${minNoches} noches` });
        }

        // 0.5 Disponibilidad y precio: siempre calculados en el servidor, nunca confiando en el cliente
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

        // 1. Si viene token, obtener ID
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const payload = jwt.verify(token, secret!) as any;
                id_usuario = payload.id;
            } catch {
                return res.status(401).json({ error: 'Token inválido' });
            }
        }

        // 2. Si no hay token, comprobar si el correo ya existe, si no existe creamos el usuario
        if (!id_usuario) {
            const [usuarios] = await pool.query(
                `SELECT id_usuario FROM usuarios WHERE email = ?`,
                [email]
            ) as any[];

            if (usuarios.length > 0) {
                return res.status(409).json({ requiereLogin: true });
            }

            id_usuario = await crearUsuario(nombre, apellidos, email, telefono, prefijo, 'cliente');
        }

        // 3. Leer snapshot de configuración en el momento de la reserva
        const [[cfgDias]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'dias_cancelacion'`) as any[];
        const [[cfgMascota]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'precio_mascota'`) as any[];
        const [[cfgDescuento]] = await pool.query(`SELECT valor FROM configuracion WHERE clave = 'descuento_no_cancelable'`) as any[];

        const diasCancelacion = parseInt(cfgDias?.valor || '30', 10);
        const precioMascotaNoche = parseFloat(cfgMascota?.valor || '10');

        // 3.5 Precio total calculado en servidor
        const round2 = (n: number) => Math.round(n * 100) / 100;
        const descuentoPct = (esNoCancelable && todosCancelables) ? (parseFloat(cfgDescuento?.valor) || 0) : 0;
        const precioHabitacion = diasRows.reduce((t: number, d: any) => t + Number(d.precio), 0);
        const descuentoEuros = round2(precioHabitacion * descuentoPct / 100);
        const precioMascotaTotal = conMascota ? noches * precioMascotaNoche : 0;
        const precio_total = round2(precioHabitacion - descuentoEuros + precioMascotaTotal);

        // 4. Insertar reserva en BD (con snapshot de datos del cliente y de configuración)
        const tokenAcceso = crypto.randomBytes(32).toString('hex');
        const [insertResult] = await pool.query(
            `INSERT INTO reservas
               (id_usuario, cliente_nombre, cliente_apellidos, cliente_email, cliente_prefijo, cliente_telefono,
                fecha_inicio, fecha_fin, n_personas, bebe, mascota, nota_adicional, precio_total, tipo_tarifa,
                descuento_aplicado, dias_cancelacion, precio_mascota_noche, estado_pago, token_acceso)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
            [id_usuario, nombre, apellidos, email, prefijo, telefono,
             fechaInicio, fechaFin, huespedes, conBebe ? 1 : 0, conMascota ? 1 : 0, nota || null,
             precio_total, tipo_tarifa, descuentoPct, diasCancelacion, precioMascotaNoche, tokenAcceso]
        ) as any[];
        const idReserva = insertResult.insertId;

        // 5. Pago con Stripe: crear sesión de Checkout y redirigir al cliente.
        //    Los emails de confirmación se envían desde el webhook cuando el pago se completa.
        const stripe = getStripe();
        if (stripe) {
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                customer_email: email,
                line_items: [{
                    quantity: 1,
                    price_data: {
                        currency: 'eur',
                        unit_amount: Math.round(precio_total * 100),
                        product_data: {
                            name: `M&H Torremolinos · ${fechaInicioFmt} → ${fechaFinFmt}`,
                            description: `${noches} noches · ${huespedes} huéspedes · Tarifa ${labelTarifa}`
                        }
                    }
                }],
                metadata: { id_reserva: String(idReserva) },
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
                success_url: `${BASE_URL}/reservar?pago=ok`,
                cancel_url: `${BASE_URL}/reservar?pago=cancelado`
            });

            await pool.query(
                `UPDATE reservas SET stripe_checkout_session_id = ? WHERE id_reserva = ?`,
                [session.id, idReserva]
            );

            return res.status(200).json({ url: session.url });
        }

        // 5-bis. Modo transferencia (Stripe no configurado): flujo antiguo con emails de solicitud

        const paymentBlock = esNoCancelable
            ? `<div style="background:#fff8f8;border-left:4px solid #8f0000;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
                <p style="margin:0 0 8px;font-size:15px;"><strong>Non-refundable rate — full payment required</strong></p>
                <p style="margin:0 0 12px;color:#555;font-size:14px;">To confirm your booking, please transfer the full amount:</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr><td style="padding:4px 0;color:#555;">Amount due now</td><td style="padding:4px 0;text-align:right;font-weight:700;font-size:16px;">${precio_total}€</td></tr>
                    <tr><td style="padding:4px 0;color:#555;">IBAN</td><td style="padding:4px 0;text-align:right;">${IBAN}</td></tr>
                    <tr><td style="padding:4px 0;color:#555;">Reference</td><td style="padding:4px 0;text-align:right;">${nombre} ${apellidos}</td></tr>
                </table>
                <p style="margin:12px 0 0;font-size:13px;color:#8f0000;">⚠ This rate does not allow cancellations or refunds once payment is made.</p>
               </div>`
            : `<div style="background:#f5f8f3;border-left:4px solid #3F4B3A;padding:16px 20px;margin:24px 0;border-radius:0 8px 8px 0;">
                <p style="margin:0 0 8px;font-size:15px;"><strong>Refundable rate — full payment to confirm</strong></p>
                <p style="margin:0 0 12px;color:#555;font-size:14px;">To confirm your booking, please transfer the full amount:</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr><td style="padding:4px 0;color:#555;">Amount due now</td><td style="padding:4px 0;text-align:right;font-weight:700;font-size:16px;">${precio_total}€</td></tr>
                    <tr><td style="padding:4px 0;color:#555;">IBAN</td><td style="padding:4px 0;text-align:right;">${IBAN}</td></tr>
                    <tr><td style="padding:4px 0;color:#555;">Reference</td><td style="padding:4px 0;text-align:right;">${nombre} ${apellidos}</td></tr>
                </table>
                <p style="margin:12px 0 0;font-size:13px;color:#3F4B3A;">✓ Free cancellation up to ${diasCancelacion} days before check-in — full refund.</p>
               </div>`;

        // 4. Email de confirmación al cliente
        await enviarCorreo(email, 'Booking request received — M&H Torremolinos', `
        <body style="margin:0;padding:0;background:#f4f4f0;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;max-width:600px;width:100%;">

                <!-- Header -->
                <tr><td style="background:#3F4B3A;padding:28px 40px;text-align:center;">
                  <h1 style="margin:0;font-family:Georgia,serif;color:#ffffff;font-size:22px;letter-spacing:1px;">M&amp;H Torremolinos</h1>
                  <p style="margin:6px 0 0;color:#b8c4b3;font-size:13px;">Calle Loma de los Riscos 117 · Torremolinos, Málaga</p>
                </td></tr>

                <!-- Body -->
                <tr><td style="padding:36px 40px;">
                  <h2 style="margin:0 0 8px;font-family:Georgia,serif;color:#3F4B3A;font-size:20px;">Hi ${nombre},</h2>
                  <p style="margin:0 0 24px;color:#555;font-size:15px;">Thank you for your booking request. Here is a summary:</p>

                  <!-- Booking details -->
                  <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px;">
                    <tr style="background:#f5f8f3;">
                      <td style="padding:10px 14px;color:#555;">Check-in</td>
                      <td style="padding:10px 14px;font-weight:700;text-align:right;">${fechaInicioFmt}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px;color:#555;">Check-out</td>
                      <td style="padding:10px 14px;font-weight:700;text-align:right;">${fechaFinFmt}</td>
                    </tr>
                    <tr style="background:#f5f8f3;">
                      <td style="padding:10px 14px;color:#555;">Guests</td>
                      <td style="padding:10px 14px;font-weight:700;text-align:right;">${huespedes}</td>
                    </tr>
                    ${conBebe ? `<tr><td style="padding:10px 14px;color:#555;">Baby cot</td><td style="padding:10px 14px;font-weight:700;text-align:right;">Yes</td></tr>` : ''}
                    ${conMascota ? `<tr style="background:#f5f8f3;"><td style="padding:10px 14px;color:#555;">Pet</td><td style="padding:10px 14px;font-weight:700;text-align:right;">Yes</td></tr>` : ''}
                    <tr style="border-top:2px solid #3F4B3A;">
                      <td style="padding:12px 14px;color:#3F4B3A;font-weight:700;">Total</td>
                      <td style="padding:12px 14px;font-weight:700;text-align:right;font-size:17px;">${precio_total}€${esNoCancelable && descuentoPct > 0 ? ` <span style="font-size:12px;color:#555;font-weight:400;">(${descuentoPct}% discount applied)</span>` : ''}</td>
                    </tr>
                  </table>

                  ${paymentBlock}

                  <p style="font-size:14px;color:#555;margin:20px 0 8px;">Once we receive your payment, we will confirm your booking by email.</p>
                  <p style="font-size:14px;color:#555;margin:0 0 24px;">If you have any questions, feel free to reply to this email or contact us at <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;">info@mhtorremolinos.com</a>.</p>

                  <p style="font-size:12px;color:#999;margin:0;">By making this payment you confirm that you have read and agree to our <a href="https://www.mhtorremolinos.com/legal" style="color:#3F4B3A;">Privacy Policy and Booking Conditions</a>.</p>
                </td></tr>

                <!-- Footer -->
                <tr><td style="background:#f5f8f3;padding:20px 40px;text-align:center;border-top:1px solid #e0e0d8;">
                  <p style="margin:0;font-size:13px;color:#888;">M&amp;H Torremolinos · <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;text-decoration:none;">info@mhtorremolinos.com</a></p>
                </td></tr>

              </table>
            </td></tr>
          </table>
        </body>
        `);

        // 5. Email a administradores
        const pagoEsperado = esNoCancelable
            ? `100% — ${precio_total}€ (non-refundable)`
            : `100% — ${precio_total}€ (refundable up to ${diasCancelacion} days before check-in)`;

        for (const admin of adminEmails) {
            await enviarCorreo(admin, `New booking request — ${nombre} ${apellidos} (${fechaInicioFmt})`, `
        <body style="margin:0;padding:0;background:#f4f4f0;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;max-width:600px;width:100%;">

                <tr><td style="background:#3F4B3A;padding:20px 32px;">
                  <h2 style="margin:0;font-family:Georgia,serif;color:#ffffff;font-size:18px;">New booking request</h2>
                  <p style="margin:4px 0 0;color:#b8c4b3;font-size:13px;">M&amp;H Torremolinos · Pending payment</p>
                </td></tr>

                <tr><td style="padding:28px 32px;">
                  <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <tr style="background:#f5f8f3;">
                      <td style="padding:10px 14px;color:#555;width:45%;">Guest</td>
                      <td style="padding:10px 14px;font-weight:700;">${nombre} ${apellidos}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px;color:#555;">Email</td>
                      <td style="padding:10px 14px;"><a href="mailto:${email}" style="color:#3F4B3A;">${email}</a></td>
                    </tr>
                    <tr style="background:#f5f8f3;">
                      <td style="padding:10px 14px;color:#555;">Phone</td>
                      <td style="padding:10px 14px;">${prefijo} ${telefono}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px;color:#555;">Check-in</td>
                      <td style="padding:10px 14px;font-weight:700;">${fechaInicioFmt}</td>
                    </tr>
                    <tr style="background:#f5f8f3;">
                      <td style="padding:10px 14px;color:#555;">Check-out</td>
                      <td style="padding:10px 14px;font-weight:700;">${fechaFinFmt}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px;color:#555;">Guests</td>
                      <td style="padding:10px 14px;">${huespedes}${conBebe ? ' · cot' : ''}${conMascota ? ' · pet' : ''}</td>
                    </tr>
                    <tr style="background:#f5f8f3;">
                      <td style="padding:10px 14px;color:#555;">Rate</td>
                      <td style="padding:10px 14px;">${labelTarifa}${esNoCancelable && descuentoPct > 0 ? ` <span style="color:#8f0000;">(${descuentoPct}% discount)</span>` : ''}</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 14px;color:#555;">Total</td>
                      <td style="padding:10px 14px;font-weight:700;font-size:16px;">${precio_total}€</td>
                    </tr>
                    <tr style="background:#f5f8f3;">
                      <td style="padding:10px 14px;color:#555;">Expected payment</td>
                      <td style="padding:10px 14px;font-weight:700;color:${esNoCancelable ? '#8f0000' : '#3F4B3A'};">${pagoEsperado}</td>
                    </tr>
                    ${nota ? `<tr><td style="padding:10px 14px;color:#555;vertical-align:top;">Note</td><td style="padding:10px 14px;">${nota}</td></tr>` : ''}
                  </table>
                </td></tr>

                <tr><td style="background:#f5f8f3;padding:16px 32px;text-align:center;border-top:1px solid #e0e0d8;">
                  <a href="https://www.mhtorremolinos.com/admin" style="display:inline-block;background:#3F4B3A;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;">Open admin panel</a>
                </td></tr>

              </table>
            </td></tr>
          </table>
        </body>
      `);
        }

        return res.status(200).json({ mensaje: 'Reserva enviada correctamente' });

    } catch (err) {
        console.error('[POST /api/reservas]', err);
        return res.status(500).json({ error: 'Error interno al procesar la reserva' });
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

        // 1.5 Reembolso Stripe si la reserva estaba pagada y se rechaza/cancela
        let reembolsado = false;
        if (['Rechazada', 'Cancelada'].includes(estado) && reserva.estado_pago === 'pagado' && reserva.stripe_payment_intent_id) {
            const stripe = getStripe();
            if (!stripe) {
                return res.status(503).json({ error: 'No se puede reembolsar: Stripe no está configurado' });
            }
            try {
                await stripe.refunds.create({ payment_intent: reserva.stripe_payment_intent_id });
                await pool.query(`UPDATE reservas SET estado_pago = 'reembolsado' WHERE id_reserva = ?`, [id]);
                reembolsado = true;
            } catch (err) {
                console.error('[PUT /api/reservas/:id/estado] error al reembolsar:', err);
                return res.status(500).json({ error: 'Error al reembolsar el pago en Stripe. El estado no se ha cambiado.' });
            }
        }

        // 2. Actualizar el estado
        await pool.query(`UPDATE reservas SET estado_reserva = ? WHERE id_reserva = ?`, [estado, id]);

        const generarDiasArray = (inicio: Date, fin: Date) => {
            const dias = [];
            const actual = new Date(inicio);
            while (actual < fin) {
                dias.push(formatearFechaSQL(new Date(actual)));
                actual.setDate(actual.getDate() + 1);
            }
            return dias;
        };

        // 3. Si se confirma
        if (estado === 'Confirmada') {
            // Generar array de días
            const dias = generarDiasArray(fechaInicio, fechaFin);


            // 3.1 Verificar disponibilidad
            const placeholders = dias.map(() => '?').join(',');
            const [disponibles] = await pool.query(`
                SELECT id_disponibilidad FROM disponibilidad
                WHERE fecha IN (${placeholders}) AND estado = 'disponible'
            `, dias) as any[];

            if (disponibles.length !== dias.length) {
                return res.status(400).json({ error: 'Uno o más días no están disponibles para reservar.' });
            }

            // 3.2 Marcar como reservados
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

            await enviarCorreo(email, 'Booking confirmed — M&H Torremolinos', `
            <body style="margin:0;padding:0;background:#f4f4f0;font-family:Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;max-width:600px;width:100%;">

                    <tr><td style="background:#3F4B3A;padding:28px 40px;text-align:center;">
                      <h1 style="margin:0;font-family:Georgia,serif;color:#ffffff;font-size:22px;letter-spacing:1px;">M&amp;H Torremolinos</h1>
                      <p style="margin:6px 0 0;color:#b8c4b3;font-size:13px;">Calle Loma de los Riscos 117 · Torremolinos, Málaga</p>
                    </td></tr>

                    <tr><td style="padding:36px 40px;text-align:center;">
                      <div style="font-size:48px;">✓</div>
                      <h2 style="margin:8px 0 4px;font-family:Georgia,serif;color:#3F4B3A;font-size:22px;">Your booking is confirmed!</h2>
                      <p style="margin:0 0 28px;color:#555;font-size:15px;">Hi ${nombre}, we are delighted to welcome you.</p>

                      <table style="width:100%;border-collapse:collapse;font-size:14px;text-align:left;">
                        <tr style="background:#f5f8f3;">
                          <td style="padding:12px 16px;color:#555;">Check-in</td>
                          <td style="padding:12px 16px;font-weight:700;text-align:right;">${fechaInicioFmt}</td>
                        </tr>
                        <tr>
                          <td style="padding:12px 16px;color:#555;">Check-out</td>
                          <td style="padding:12px 16px;font-weight:700;text-align:right;">${fechaFinFmt}</td>
                        </tr>
                      </table>

                      <p style="font-size:14px;color:#555;margin:24px 0 8px;">If you have any questions before your arrival, feel free to contact us at <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;">info@mhtorremolinos.com</a>.</p>
                      <p style="font-size:15px;color:#3F4B3A;margin:0;"><em>We look forward to seeing you soon!</em></p>
                    </td></tr>

                    <tr><td style="background:#f5f8f3;padding:20px 40px;text-align:center;border-top:1px solid #e0e0d8;">
                      <p style="margin:0;font-size:13px;color:#888;">M&amp;H Torremolinos · <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;text-decoration:none;">info@mhtorremolinos.com</a></p>
                    </td></tr>

                  </table>
                </td></tr>
              </table>
            </body>
            `);
        }

        if (['Rechazada', 'Cancelada'].includes(estado)) {
            const dias = generarDiasArray(fechaInicio, fechaFin);

            for (const fecha of dias) {
                await pool.query(`
                    UPDATE disponibilidad
                    SET estado = 'disponible', fuente = 'local', id_reserva = NULL
                    WHERE fecha = ? AND id_reserva = ?
                `, [fecha, id]);
            }

            const asunto = estado === 'Rechazada'
                ? 'Booking request update — M&H Torremolinos'
                : 'Booking cancellation — M&H Torremolinos';

            const mensajePrincipal = estado === 'Rechazada'
                ? `We are sorry to inform you that we were unable to confirm your booking request for the selected dates.`
                : `As requested, your booking has been cancelled.`;

            let mensajeSecundario = estado === 'Rechazada'
                ? `We apologise for the inconvenience. Please feel free to contact us to check alternative dates.`
                : `If you have any questions regarding your cancellation, please don't hesitate to get in touch.`;

            if (reembolsado) {
                mensajeSecundario = `Your payment of ${Number(reserva.importe_pagado || reserva.precio_total).toFixed(2)}€ has been refunded in full to your original payment method. Depending on your bank, it may take a few days to appear. ` + mensajeSecundario;
            }

            await enviarCorreo(email, asunto, `
            <body style="margin:0;padding:0;background:#f4f4f0;font-family:Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 0;">
                <tr><td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;max-width:600px;width:100%;">

                    <tr><td style="background:#3F4B3A;padding:28px 40px;text-align:center;">
                      <h1 style="margin:0;font-family:Georgia,serif;color:#ffffff;font-size:22px;letter-spacing:1px;">M&amp;H Torremolinos</h1>
                      <p style="margin:6px 0 0;color:#b8c4b3;font-size:13px;">Calle Loma de los Riscos 117 · Torremolinos, Málaga</p>
                    </td></tr>

                    <tr><td style="padding:36px 40px;">
                      <h2 style="margin:0 0 8px;font-family:Georgia,serif;color:#3F4B3A;font-size:20px;">Hi ${nombre},</h2>
                      <p style="margin:0 0 20px;color:#555;font-size:15px;">${mensajePrincipal}</p>

                      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
                        <tr style="background:#f5f8f3;">
                          <td style="padding:10px 14px;color:#555;">Check-in</td>
                          <td style="padding:10px 14px;font-weight:700;text-align:right;">${formatearFecha(fechaInicio)}</td>
                        </tr>
                        <tr>
                          <td style="padding:10px 14px;color:#555;">Check-out</td>
                          <td style="padding:10px 14px;font-weight:700;text-align:right;">${formatearFecha(fechaFin)}</td>
                        </tr>
                      </table>

                      <p style="font-size:14px;color:#555;margin:0 0 8px;">${mensajeSecundario}</p>
                      <p style="font-size:14px;color:#555;margin:0;">You can reach us at <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;">info@mhtorremolinos.com</a>.</p>
                    </td></tr>

                    <tr><td style="background:#f5f8f3;padding:20px 40px;text-align:center;border-top:1px solid #e0e0d8;">
                      <p style="margin:0;font-size:13px;color:#888;">M&amp;H Torremolinos · <a href="mailto:info@mhtorremolinos.com" style="color:#3F4B3A;text-decoration:none;">info@mhtorremolinos.com</a></p>
                    </td></tr>

                  </table>
                </td></tr>
              </table>
            </body>
            `);
        }

        return res.json({ mensaje: 'Estado actualizado correctamente' });
    } catch (err) {
        console.error('[PUT /api/reservas/:id/estado]', err);
        return res.status(500).json({ error: 'Error al actualizar el estado de la reserva' });
    }
});

export default router;
