// Backend de usuarios
import express, { Request, Response } from 'express';
import { pool } from '../db.js';
import { verificarToken } from './middleware/verificarToken.js';
import { generarContrasenaTemporal, hashearContrasena } from './utils/password.js';
import { enviarCorreo } from './utils/mailer.js';
import { crearUsuario } from './utils/usuarios.js';

interface RequestConUsuario extends Request {
	usuario?: {
		id: number;
		rol: string;
		nombre?: string;
		[key: string]: any;
	};
}

const router = express.Router();

router.get('/me', verificarToken, async (req: RequestConUsuario, res: Response) => {
	const id = req.usuario?.id;
	if (!id) return res.status(401).json({ error: 'Token inválido' });

	try {
		const [filas] = await pool.query(
			`SELECT nombre, apellidos, email, prefijo, telefono FROM usuarios WHERE id_usuario = ?`,
			[id]
		) as unknown as [any[]];

		if (Array.isArray(filas) && filas.length === 0) {
			return res.status(404).json({ error: 'Usuario no encontrado' });
		}

		return res.json(filas[0]);
	} catch (err) {
		console.error('Error al obtener datos del usuario:', err);
		return res.status(500).json({ error: 'Error en el servidor' });
	}
});

router.put('/me', verificarToken, async (req: RequestConUsuario, res: Response) => {
	const id = req.usuario?.id;
	if (!id) return res.status(401).json({ error: 'Token inválido' });

	const { nombre, apellidos, email, prefijo, telefono } = req.body;

	try {
		await pool.query(
			`UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, prefijo = ?, telefono = ? WHERE id_usuario = ?`,
			[nombre, apellidos, email, prefijo, telefono, id]
		);

		return res.json({ mensaje: 'Datos actualizados correctamente' });
	} catch (err) {
		console.error('Error al actualizar datos del usuario:', err);
		return res.status(500).json({ error: 'Error en el servidor' });
	}
});

router.put('/me/password', verificarToken, async (req: RequestConUsuario, res: Response) => {
	const id = req.usuario?.id;
	if (!id) return res.status(401).json({ error: 'Token inválido' });

	const { actual, nueva, confirmar } = req.body;

	if (!actual || !nueva || !confirmar) {
		return res.status(400).json({ error: 'Faltan campos' });
	}

	if (nueva !== confirmar) {
		return res.status(400).json({ error: 'Las contraseñas no coinciden' });
	}

	try {
		const [filas] = await pool.query(
			`SELECT contrasena FROM usuarios WHERE id_usuario = ?`,
			[id]
		) as unknown as [any[]];

		const contrasenaHash = filas[0]?.contrasena;
		const actualHash = hashearContrasena(actual);

		if (actualHash !== contrasenaHash) {
			return res.status(403).json({ error: 'La contraseña actual es incorrecta' });
		}

		const nuevaHash = hashearContrasena(nueva);
		await pool.query(
			`UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?`,
			[nuevaHash, id]
		);

		return res.json({ mensaje: 'Contraseña actualizada correctamente' });
	} catch (err) {
		console.error('Error al actualizar la contraseña:', err);
		return res.status(500).json({ error: 'Error en el servidor' });
	}
});


router.get('/', verificarToken, async (req: RequestConUsuario, res: Response) => {
	if (req.usuario?.rol !== 'administrador') {
		return res.status(403).json({ error: 'Acceso denegado' });
	}

	try {
		const [usuarios] = await pool.query(
			`SELECT id_usuario, nombre, apellidos, email, prefijo, telefono, rol FROM usuarios`
		) as unknown as [any[]];

		return res.json(usuarios);
	} catch (err) {
		console.error('Error al obtener usuarios:', err);
		return res.status(500).json({ error: 'Error en el servidor' });
	}
});

// Actualizar un usuario por ID
router.put('/:id', verificarToken, async (req: RequestConUsuario, res: Response) => {
	if (req.usuario?.rol !== 'administrador') {
		return res.status(403).json({ error: 'Acceso denegado' });
	}

	const { nombre, apellidos, email, prefijo, telefono, rol } = req.body;
	const { id } = req.params;

	try {
		await pool.query(
			`UPDATE usuarios SET nombre = ?, apellidos = ?, email = ?, prefijo = ?, telefono = ?, rol = ? WHERE id_usuario = ?`,
			[nombre, apellidos, email, prefijo, telefono, rol, id]
		);
		return res.json({ mensaje: 'Usuario actualizado correctamente' });
	} catch (err) {
		console.error('Error al actualizar usuario:', err);
		return res.status(500).json({ error: 'Error en el servidor' });
	}
});

// Eliminar un usuario por ID
router.delete('/:id', verificarToken, async (req: RequestConUsuario, res: Response) => {
	if (req.usuario?.rol !== 'administrador') {
		return res.status(403).json({ error: 'Acceso denegado' });
	}

	const { id } = req.params;

	try {
		await pool.query(`DELETE FROM usuarios WHERE id_usuario = ?`, [id]);
		return res.json({ mensaje: 'Usuario eliminado correctamente' });
	} catch (err) {
		console.error('Error al eliminar usuario:', err);
		return res.status(500).json({ error: 'Error en el servidor' });
	}
});

router.post('/crear', verificarToken, async (req: RequestConUsuario, res: Response) => {
	if (req.usuario?.rol !== 'administrador') {
		return res.status(403).json({ error: 'Acceso denegado' });
	}

	const { nombre, apellidos, email, telefono, prefijo, rol } = req.body;

	if (!nombre || !apellidos || !email || !telefono || !prefijo || !rol) {
		return res.status(400).json({ error: 'Faltan campos obligatorios' });
	}

	try {
		const id_usuario = await crearUsuario(nombre, apellidos, email, telefono, prefijo, rol);
		return res.status(201).json({ mensaje: 'Usuario creado correctamente', id_usuario });
	} catch (error) {
		console.error('Error al crear usuario:', error);
		return res.status(500).json({ error: 'Error al crear usuario' });
	}
});

router.post('/recover', async (req: Request, res: Response) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({ error: 'El correo es obligatorio' });
	}

	try {
		const [usuarios] = await pool.query(
			`SELECT id_usuario, nombre FROM usuarios WHERE email = ?`,
			[email]
		) as any[];

		if (usuarios.length === 0) {
			// No dar pista de si el email existe o no
			return res.status(200).json({ mensaje: 'Si el correo está registrado, se enviará una nueva contraseña' });
		}

		const usuario = usuarios[0];
		const nuevaPassword = generarContrasenaTemporal();
		const hash = hashearContrasena(nuevaPassword);

		// Actualizar la contraseña
		await pool.query(
			`UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?`,
			[hash, usuario.id_usuario]
		);

		// Enviar correo
		await enviarCorreo(email, 'Recuperación de contraseña', `
            <body style="font-family: Arial, sans-serif; color: #3F4B3A;">
                <h2 style="font-family: Georgia, serif; color: #3F4B3A;">Hola ${usuario.nombre},</h2>
                <p>Tu nueva contraseña temporal es:</p>
                <p><strong>${nuevaPassword}</strong></p>
                <p>Puedes iniciar sesión y cambiarla cuando quieras aquí:
                <a href="https://www.mhtorremolinos.com/iniciar-sesion">Iniciar sesión</a></p>
            </body>
        `);

		return res.status(200).json({ mensaje: 'Si el correo está registrado, se enviará una nueva contraseña' });

	} catch (error) {
		console.error('Error al recuperar contraseña:', error);
		return res.status(500).json({ error: 'Error al procesar la solicitud' });
	}
});

export default router;
