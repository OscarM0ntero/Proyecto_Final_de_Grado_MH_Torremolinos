// Backend de disponibilidad y calendario
import express from 'express';
import { pool } from '../db.js';
import { sincronizarIcalThrottled } from '../icalSync.js';

const router = express.Router();

router.get('/', async (req, res) => {
	const mes = req.query['mes'] as string;

	if (mes) {
		try {
			const [anioStr, mesStr] = mes.split('-');
			const anio = parseInt(anioStr, 10);
			const mesNum = parseInt(mesStr, 10);

			if (isNaN(anio) || isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
				return res.status(400).json({ error: 'Formato de mes inválido. Debe ser YYYY-MM' });
			}

			const ultimoDia = new Date(anio, mesNum, 0).getDate();
			const inicio = `${anio}-${mesStr.padStart(2, '0')}-01`;
			const fin = `${anio}-${mesStr.padStart(2, '0')}-${ultimoDia.toString().padStart(2, '0')}`;

			const [filas] = await pool.query(
				`SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, precio, estado FROM disponibilidad WHERE fecha BETWEEN ? AND ? ORDER BY fecha ASC`,
				[inicio, fin]
			);

			return res.json(filas);
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: 'Error al obtener disponibilidad del mes' });
		}
	}

	sincronizarIcalThrottled();

	try {
		const [filas] = await pool.query(
			`SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, precio, estado, fuente FROM disponibilidad ORDER BY fecha ASC`
		);
		return res.json(filas);
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: 'Error al obtener disponibilidad global' });
	}
});

router.post('/actualizar', async (req, res) => {
	const { fechas, precio, estado } = req.body;

	if (!fechas || !Array.isArray(fechas) || !estado) {
		return res.status(400).json({ error: 'Faltan datos: fechas (array) y estado son obligatorios.' });
	}

	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();

		for (const fecha of fechas) {
			if (precio !== undefined && precio !== null) {
				await connection.query(
					`UPDATE disponibilidad SET estado = ?, precio = ?, actualizado = CURRENT_TIMESTAMP WHERE fecha = ?`,
					[estado, precio, fecha]
				);
			} else {
				await connection.query(
					`UPDATE disponibilidad SET estado = ?, actualizado = CURRENT_TIMESTAMP WHERE fecha = ?`,
					[estado, fecha]
				);
			}
		}

		await connection.commit();
		res.json({ success: true });
	} catch (err) {
		await connection.rollback();
		console.error(err);
		res.status(500).json({ error: 'Error al actualizar la disponibilidad.' });
	} finally {
		connection.release();
	}
	return;
});

export default router;
