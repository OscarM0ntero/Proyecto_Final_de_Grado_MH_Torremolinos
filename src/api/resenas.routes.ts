import { Router, Request, Response } from 'express';
import { pool } from '../db.js';
import { verificarToken } from './middleware/verificarToken.js';

interface RequestConUsuario extends Request {
	usuario?: { id: number; rol: string; [key: string]: any };
}

const router = Router();

router.get('/', async (_req, res: Response) => {
	try {
		const [rows] = await pool.query(
			'SELECT * FROM resenas WHERE activa = 1 ORDER BY id_resena DESC'
		) as unknown as [any[]];
		return res.json(rows);
	} catch (error) {
		console.error('[ERROR GET /api/resenas]:', error);
		return res.status(500).json({ error: 'Error al obtener reseñas' });
	}
});

router.get('/all', verificarToken, async (req: RequestConUsuario, res: Response) => {
	if (req.usuario?.rol !== 'administrador') return res.status(403).json({ error: 'Acceso denegado' });
	try {
		const [rows] = await pool.query(
			'SELECT * FROM resenas ORDER BY id_resena DESC'
		) as unknown as [any[]];
		return res.json(rows);
	} catch (error) {
		console.error('[ERROR GET /api/resenas/all]:', error);
		return res.status(500).json({ error: 'Error al obtener reseñas' });
	}
});

router.post('/', verificarToken, async (req: RequestConUsuario, res: Response) => {
	if (req.usuario?.rol !== 'administrador') return res.status(403).json({ error: 'Acceso denegado' });
	const { nombre, pais, iso, titulo, puntuacion, texto_positivo, texto_negativo, fecha_estancia, activa } = req.body;
	try {
		const [result] = await pool.query(
			'INSERT INTO resenas (nombre, pais, iso, titulo, puntuacion, texto_positivo, texto_negativo, fecha_estancia, activa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
			[nombre, pais, iso, titulo || '', puntuacion, texto_positivo || '', texto_negativo || '', fecha_estancia || '', activa ?? 1]
		) as unknown as [any];
		return res.status(201).json({ id_resena: result.insertId });
	} catch (error) {
		console.error('[ERROR POST /api/resenas]:', error);
		return res.status(500).json({ error: 'Error al crear reseña' });
	}
});

router.put('/:id', verificarToken, async (req: RequestConUsuario, res: Response) => {
	if (req.usuario?.rol !== 'administrador') return res.status(403).json({ error: 'Acceso denegado' });
	const { nombre, pais, iso, titulo, puntuacion, texto_positivo, texto_negativo, fecha_estancia, activa } = req.body;
	try {
		await pool.query(
			'UPDATE resenas SET nombre = ?, pais = ?, iso = ?, titulo = ?, puntuacion = ?, texto_positivo = ?, texto_negativo = ?, fecha_estancia = ?, activa = ? WHERE id_resena = ?',
			[nombre, pais, iso, titulo || '', puntuacion, texto_positivo || '', texto_negativo || '', fecha_estancia || '', activa, req.params['id']]
		);
		return res.json({ mensaje: 'Reseña actualizada' });
	} catch (error) {
		console.error('[ERROR PUT /api/resenas/:id]:', error);
		return res.status(500).json({ error: 'Error al actualizar reseña' });
	}
});

router.delete('/:id', verificarToken, async (req: RequestConUsuario, res: Response) => {
	if (req.usuario?.rol !== 'administrador') return res.status(403).json({ error: 'Acceso denegado' });
	try {
		await pool.query('DELETE FROM resenas WHERE id_resena = ?', [req.params['id']]);
		return res.json({ mensaje: 'Reseña eliminada' });
	} catch (error) {
		console.error('[ERROR DELETE /api/resenas/:id]:', error);
		return res.status(500).json({ error: 'Error al eliminar reseña' });
	}
});

export default router;
