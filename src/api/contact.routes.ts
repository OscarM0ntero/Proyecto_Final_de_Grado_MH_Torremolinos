// Backend de contacto, para el formulario
import express from 'express';
import { enviarCorreo } from './utils/mailer.js';
import { verificarRecaptcha } from './utils/verificarRecaptcha.js';

const router = express.Router();
const adminEmails = ['info@mhtorremolinos.com','mhtorremolinos@gmail.com'];

router.post('/', async (req, res) => {
    const { nombre, email, telefono, mensaje, recaptcha } = req.body;

    const esValido = await verificarRecaptcha(recaptcha);
    if (!esValido) {
        return res.status(400).json({ error: 'Fallo en reCAPTCHA' });
    }

    try {
        const html = `
            <body style="font-family: Arial, sans-serif; color: #3F4B3A;">
                <h2>Nuevo mensaje de contacto</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${telefono}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${mensaje}</p>
            </body>
        `;

        // Enviar a todos los correos de admin
        for (const destino of adminEmails) {
            await enviarCorreo(destino, 'Mensaje desde formulario de contacto', html, { replyTo: email });
        }
        return res.status(200).json({ mensaje: 'Mensaje enviado' });
    } catch (err: unknown) {
        return res.status(500).json({ error: 'Error al enviar el mensaje' });
    }



});

export default router;
