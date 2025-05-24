import express, { Request, Response } from 'express';
import { pool } from '../db.js';
import { verificarToken } from './middleware/verificarToken.js';
import { hashearContrasena } from './utils/password.js';

// Tipo extendido para incluir `usuario` en `req`
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


export default router;
