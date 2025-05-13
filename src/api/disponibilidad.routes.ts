import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const mes = req.query['mes'] as string;
        if (!mes) {
            return res.status(400).json({ error: 'Falta el parámetro mes' });
        }

        const [anioStr, mesStr] = mes.split('-');
        const anio = parseInt(anioStr, 10);
        const mesNum = parseInt(mesStr, 10);

        if (isNaN(anio) || isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
            return res.status(400).json({ error: 'Formato de mes inválido. Debe ser YYYY-MM' });
        }

        // Calcular el último día del mes
        const ultimoDia = new Date(anio, mesNum, 0).getDate(); // mesNum ya es 1-based

        const inicio = `${anio}-${mesStr.padStart(2, '0')}-01`;
        const fin = `${anio}-${mesStr.padStart(2, '0')}-${ultimoDia.toString().padStart(2, '0')}`;

        const [filas] = await pool.query(
            `SELECT fecha, precio, estado FROM disponibilidad WHERE fecha BETWEEN ? AND ? ORDER BY fecha ASC`,
            [inicio, fin]
        );

        return res.json(filas);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al obtener disponibilidad' });
    }
});

export default router;
