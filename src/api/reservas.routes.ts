// Backend de reservas
import express from 'express';
import { pool } from '../db.js';
import { enviarCorreo } from './utils/mailer.js';
import dotenv from 'dotenv';
import { verificarRecaptcha } from './utils/verificarRecaptcha.js';
import { crearUsuario } from './utils/usuarios.js';

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

router.get('/', async (req, res) => {
    const estado = req.query['estado'] as string;
    const estadosPermitidos = ['Pendiente', 'Confirmada', 'Rechazada', 'Cancelada', 'Finalizada'];
    if (estado) {
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({ error: 'Estado no válido' });
        }

        try {
            const [rows] = await pool.query(
                `SELECT r.*, u.nombre, u.apellidos, u.email, u.prefijo, u.telefono
             FROM reservas r
             JOIN usuarios u ON r.id_usuario = u.id_usuario
             WHERE r.estado_reserva = ?
             ORDER BY r.fecha_inicio ASC`,
                [estado]
            );
            res.json(rows);
        } catch (err) {
            console.error('[GET /api/reservas/?estado=]' + estado, err);
            res.status(500).json({ error: 'Error al obtener reservas por estado' });
        }
    } else {
        try {
            const [rows] = await pool.query(
                `SELECT r.*, u.nombre, u.apellidos, u.email, u.prefijo, u.telefono
             FROM reservas r
             JOIN usuarios u ON r.id_usuario = u.id_usuario
             ORDER BY r.fecha_inicio ASC`
            );
            res.json(rows);
        } catch (err) {
            console.error('[GET /api/reservas]', err);
            res.status(500).json({ error: 'Error al obtener las reservas' });
        }
    }
    return;
});


router.get('/cliente', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No autorizado' });

    try {
        const token = authHeader.split(' ')[1];
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const id_usuario = payload.id;

        const [rows] = await pool.query(
            `SELECT r.*, u.nombre, u.apellidos, u.email, u.prefijo, u.telefono
             FROM reservas r
             JOIN usuarios u ON r.id_usuario = u.id_usuario
             WHERE r.id_usuario = ?
             ORDER BY r.fecha_inicio ASC`,
            [id_usuario]
        );

        res.json(rows);
    } catch (err) {
        console.error('[GET /api/reservas/cliente]', err);
        res.status(500).json({ error: 'Error al obtener tus reservas' });
    }
    return;
});


// Configuración desde .env
const IBAN = process.env['RESERVA_IBAN'] || 'IBAN_NO_CONFIGURADO';
const ANTICIPO_PORCENTAJE = parseInt(process.env['RESERVA_ANTICIPO_PORCENTAJE'] || '30', 10);
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
        fechaInicio, fechaFin, precio_total
    } = req.body;

    const fechaInicioFmt = formatearFecha(fechaInicio);
    const fechaFinFmt = formatearFecha(fechaFin);

    let id_usuario = null;

    try {
        // 1. Si viene token, obtener ID
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
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

        // 3. Insertar reserva en BD
        await pool.query(
            `INSERT INTO reservas (id_usuario, fecha_inicio, fecha_fin, n_personas, bebe, mascota, nota_adicional, precio_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_usuario, fechaInicio, fechaFin, huespedes, conBebe ? 1 : 0, conMascota ? 1 : 0, nota || null, precio_total]
        );

        const anticipo = Math.round(precio_total * (ANTICIPO_PORCENTAJE / 100));

        // 4. Email de confirmación al cliente
        await enviarCorreo(email, 'Solicitud de reserva recibida', `
        <body style="font-family: Arial, sans-serif; color: #3F4B3A;">
            <h2 style="font-family: Georgia, serif; color: #3F4B3A;">Hola ${nombre},</h2>

            <p>Hemos recibido tu solicitud de reserva:</p>
            <ul>
                <li><strong>Entrada:</strong> ${fechaInicioFmt}</li>
                <li><strong>Salida:</strong> ${fechaFinFmt}</li>
                <li><strong>Huéspedes:</strong> ${huespedes}</li>
                <li><strong>Bebé:</strong> ${conBebe ? 'Sí' : 'No'}</li>
                <li><strong>Mascota:</strong> ${conMascota ? 'Sí' : 'No'}</li>
            </ul>
            <p>Para confirmar tu reserva, realiza una transferencia del <strong>${ANTICIPO_PORCENTAJE}%</strong> del total 
            (<strong>${anticipo}€</strong>) a:</p>
            <p><strong>IBAN:</strong> ${IBAN}</p>
            <p><strong>Concepto:</strong> ${nombre} ${apellidos}</p>
            <p>Al realizar este pago, confirmas que has leído y aceptas la <a href="https://www.mhtorremolinos.com/legal#privacy">Politica de Privacidad</a> y <a href="https://www.mhtorremolinos.com/legal#booking">Condiciones de la Reserva</a></p>
            <p>Una vez recibido el pago, te confirmaremos la reserva por email.</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p style="margin-top: 20px;"><em>Gracias por confiar en M&H Torremolinos.</em></p>
        </body>
        `);

        // 5. Email a administradores
        for (const admin of adminEmails) {
            await enviarCorreo(admin, 'Nueva solicitud de reserva', `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Della+Respira&family=Roboto&display=swap');
          body {
            font-family: 'Roboto', sans-serif;
            color: #3F4B3A;
          }
          h1, h2, h3 {
            font-family: 'Della Respira', serif;
            color: #3F4B3A;
          }
        </style>
        <body>
          <h3>Reserva pendiente</h3>
          <p><strong>Cliente:</strong> ${nombre} ${apellidos}</p>
          <p><strong>Fechas:</strong> ${fechaInicioFmt} → ${fechaFinFmt}</p>
          <p><strong>Email:</strong> ${email} | <strong>Tel:</strong> ${prefijo} ${telefono}</p>
          <p><strong>Personas:</strong> ${huespedes} | <strong>Bebé:</strong> ${conBebe ? 'Sí' : 'No'} | <strong>Mascota:</strong> ${conMascota ? 'Sí' : 'No'}</p>
          <p><strong>Nota:</strong> ${nota || 'Sin nota'}</p>
          <p><strong>Total:</strong> ${precio_total}€</p>
        </body>
      `);
        }

        return res.status(200).json({ mensaje: 'Reserva enviada correctamente' });

    } catch (err) {
        console.error('Error al procesar la reserva:', err);
        return res.status(500).json({ error: 'Error interno al procesar la reserva' });
    }
});

router.put('/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ['Pendiente', 'Confirmada', 'Rechazada', 'Cancelada', 'Finalizada'];
    if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido' });
    }

    try {
        // 1. Obtener datos de la reserva
        const [rows] = await pool.query(`
            SELECT r.*, u.nombre, u.apellidos, u.email
            FROM reservas r
            JOIN usuarios u ON r.id_usuario = u.id_usuario
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

            console.log('Placeholders:', placeholders);
            console.log('Disponibles:', disponibles);
            console.log('Días solicitados:', dias);
            console.log('Días disponibles en DB:', disponibles.map((d: { fecha: any; }) => d.fecha));

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

            await enviarCorreo(email, 'Reserva confirmada', `
                <body style="font-family: Arial, sans-serif; color: #3F4B3A;">
                    <h2 style="font-family: Georgia, serif;">Hola ${nombre},</h2>
                    <p>Tu reserva ha sido <strong>confirmada</strong>.</p>
                    <ul>
                        <li><strong>Entrada:</strong> ${fechaInicioFmt}</li>
                        <li><strong>Salida:</strong> ${fechaFinFmt}</li>
                    </ul>
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    <p>Gracias por confiar en M&H Torremolinos, estamos deseando recibirte.</p>
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

            const asunto = estado === 'Rechazada' ? 'Reserva rechazada' : 'Reserva cancelada';
            const mensaje = estado === 'Rechazada'
                ? `Lamentamos informarte que tu solicitud de reserva ha sido <strong>rechazada</strong>.`
                : `Como solicitaste, tu reserva ha sido <strong>cancelada</strong>.`;

            await enviarCorreo(email, asunto, `
                <body style="font-family: Arial, sans-serif; color: #3F4B3A;">
                    <h2 style="font-family: Georgia, serif;">Hola ${nombre},</h2>
                    <p>${mensaje}</p>
                    <ul>
                        <li><strong>Entrada:</strong> ${formatearFecha(fechaInicio)}</li>
                        <li><strong>Salida:</strong> ${formatearFecha(fechaFin)}</li>
                    </ul>
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                    <p>Atentamente,<br/>M&H Torremolinos</p>
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
