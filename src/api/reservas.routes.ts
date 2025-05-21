import express from 'express';
import { pool } from '../db.js';
import { generarContrasenaTemporal, hashearContrasena } from './utils/password.js';
import { enviarCorreo } from './utils/mailer.js';
import dotenv from 'dotenv';
import { verificarRecaptcha } from './utils/verificarRecaptcha.js';

function formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const año = d.getFullYear();
    return `${dia}-${mes}-${año}`;
}


dotenv.config();

const router = express.Router();

// Configuración desde .env
const IBAN = process.env['RESERVA_IBAN'] || 'IBAN_NO_CONFIGURADO';
const ANTICIPO_PORCENTAJE = parseInt(process.env['RESERVA_ANTICIPO_PORCENTAJE'] || '30', 10);
const adminEmails = ['info@mhtorremolinos.com'];

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

        // 2. Si no hay token, comprobar si el correo ya existe
        if (!id_usuario) {
            const [usuarios] = await pool.query(
                `SELECT id_usuario FROM usuarios WHERE email = ?`,
                [email]
            ) as any[];

            if (usuarios.length > 0) {
                return res.status(409).json({ requiereLogin: true });
            }

            // 3. Crear usuario nuevo
            const passAuto = generarContrasenaTemporal();
            const hash = hashearContrasena(passAuto);

            const [insertado] = await pool.query(
                `INSERT INTO usuarios (nombre, apellidos, email, telefono, prefijo, contrasena, rol)
         VALUES (?, ?, ?, ?, ?, ?, 'cliente')`,
                [nombre, apellidos, email, telefono, prefijo, hash]
            ) as any;

            id_usuario = insertado.insertId;

            // 4. Email al cliente con credenciales
            await enviarCorreo(email, 'Tu cuenta ha sido creada', `
            <body style="font-family: Arial, sans-serif; color: #3F4B3A;">
                <h2 style="font-family: Georgia, serif; color: #3F4B3A;">Hola ${nombre},</h2>
                <p>Tu cuenta ha sido creada para gestionar tu reserva.</p>
                <p><b>Correo:</b> ${email}<br/><b>Contraseña:</b> ${passAuto}</p>
                <p>Puedes iniciar sesión aquí: <a href="https://www.mhtorremolinos.com/iniciar-sesion">Iniciar sesión</a></p>
            </body>
      `);
        }

        // 5. Insertar reserva en BD
        await pool.query(
            `INSERT INTO reservas (id_usuario, fecha_inicio, fecha_fin, n_personas, bebe, mascota, nota_adicional, precio_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_usuario, fechaInicio, fechaFin, huespedes, conBebe ? 1 : 0, conMascota ? 1 : 0, nota || null, precio_total]
        );

        const anticipo = Math.round(precio_total * (ANTICIPO_PORCENTAJE / 100));

        // 6. Email de confirmación al cliente
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
            <p>Una vez recibido el pago, te confirmaremos la reserva por email.</p>
            <p style="margin-top: 20px;"><em>Gracias por confiar en M&H Torremolinos.</em></p>
        </body>
        `);

        // 7. Email a administradores
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

export default router;
