import express from 'express';
import { pool } from '../db.js';
import { verificarToken } from './middleware/verificarToken.js';

const router = express.Router();

// GET /api/configuracion/:clave — público
router.get('/:clave', async (req, res) => {
    const { clave } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT valor, descripcion FROM configuracion WHERE clave = ?',
            [clave]
        ) as any[];
        if (rows.length === 0) return res.status(404).json({ error: 'Clave no encontrada' });
        return res.json({ clave, valor: rows[0].valor, descripcion: rows[0].descripcion });
    } catch (err) {
        console.error('[GET /api/configuracion/:clave]', err);
        return res.status(500).json({ error: 'Error al obtener configuración' });
    }
});

// PUT /api/configuracion/:clave — solo admin
router.put('/:clave', verificarToken, async (req: any, res) => {
    if (req.usuario?.rol !== 'administrador') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    const { clave } = req.params;
    const { valor } = req.body;
    if (valor === undefined || valor === null || String(valor).trim() === '') {
        return res.status(400).json({ error: 'El valor es obligatorio' });
    }
    try {
        const [result] = await pool.query(
            'UPDATE configuracion SET valor = ? WHERE clave = ?',
            [String(valor).trim(), clave]
        ) as any[];
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Clave no encontrada' });
        return res.json({ mensaje: 'Configuración actualizada' });
    } catch (err) {
        console.error('[PUT /api/configuracion/:clave]', err);
        return res.status(500).json({ error: 'Error al actualizar configuración' });
    }
});

export default router;
