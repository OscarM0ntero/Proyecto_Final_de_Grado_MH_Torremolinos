import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET /api/disponibilidad?mes=YYYY-MM → por mes
router.get('/', async (req, res) => {
  const mes = req.query['mes'] as string;

  // Si hay query `mes`, devuelve disponibilidad del mes
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

  // Si NO hay query `mes`, devuelve TODO el calendario
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

export default router;
