import express, { Request, Response } from 'express';
import { pool } from '../db.js';
import { verificarToken } from './middleware/verificarToken.js';

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

export default router;
