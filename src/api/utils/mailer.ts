import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
    host: process.env['EMAIL_HOST'],
    port: parseInt(process.env['EMAIL_PORT'] || '587'),
    secure: false,
    auth: {
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASS']
    },
    tls: {
        rejectUnauthorized: false
    }
});
/*
transporter.verify((err) => {
    if (err) {
        console.error('❌ Error SMTP:', err);
    } else {
        console.log('✅ SMTP conectado correctamente');
    }
});
*/
export async function enviarCorreo(destino: string, asunto: string, html: string) {
    await transporter.sendMail({
        from: `"M&H Torremolinos" <${process.env['EMAIL_USER']}>`,
        to: destino,
        subject: asunto,
        html
    });
}
