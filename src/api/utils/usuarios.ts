import { pool } from '../../db.js';
import { generarContrasenaTemporal, hashearContrasena } from './password.js';
import { enviarCorreo } from './mailer.js';

export async function crearUsuario(nombre: string, apellidos: string, email: string, telefono: string, prefijo: string, rol: string) {
    // Generar contraseña automática
    const passAuto = generarContrasenaTemporal();
    const hash = hashearContrasena(passAuto);

    // Insertar en base de datos
    const [insertado] = await pool.query(
        `INSERT INTO usuarios (nombre, apellidos, email, telefono, prefijo, contrasena, rol)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nombre, apellidos, email, telefono, prefijo, hash, rol]
    ) as any;

    const id_usuario = insertado.insertId;

    // Enviar correo
    await enviarCorreo(email, 'Tu cuenta ha sido creada', `
        <body style="font-family: Arial, sans-serif; color: #3F4B3A;">
            <h2 style="font-family: Georgia, serif; color: #3F4B3A;">Hola ${nombre},</h2>
            <p>Tu cuenta ha sido creada, puedes iniciar sesión con los siguientes credenciales:</p>
            <p><b>Correo:</b> ${email}<br/><b>Contraseña:</b> ${passAuto}</p>
            <p>Puedes iniciar sesión aquí: <a href="https://www.mhtorremolinos.com/iniciar-sesion">Iniciar sesión</a></p>
        </body>
    `);

    return id_usuario;
}
