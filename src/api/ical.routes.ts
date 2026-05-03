import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

function toIcalDate(dateStr: string): string {
    return dateStr.replace(/-/g, '');
}

// Agrupa días consecutivos en rangos [inicio, fin_exclusivo]
function agruparConsecutivos(fechas: string[]): { inicio: string; fin: string }[] {
    if (fechas.length === 0) return [];

    const rangos: { inicio: string; fin: string }[] = [];
    let inicioRango = fechas[0];
    let anterior = new Date(fechas[0]);

    for (let i = 1; i < fechas.length; i++) {
        const actual = new Date(fechas[i]);
        const esperado = new Date(anterior);
        esperado.setDate(esperado.getDate() + 1);

        if (actual.toISOString().slice(0, 10) !== esperado.toISOString().slice(0, 10)) {
            // Fin del rango actual: DTEND es el día siguiente al último día ocupado
            const finExclusivo = new Date(anterior);
            finExclusivo.setDate(finExclusivo.getDate() + 1);
            rangos.push({ inicio: inicioRango, fin: finExclusivo.toISOString().slice(0, 10) });
            inicioRango = fechas[i];
        }

        anterior = actual;
    }

    const finExclusivo = new Date(anterior);
    finExclusivo.setDate(finExclusivo.getDate() + 1);
    rangos.push({ inicio: inicioRango, fin: finExclusivo.toISOString().slice(0, 10) });

    return rangos;
}

router.get('/export', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha
             FROM disponibilidad
             WHERE estado IN ('reservada', 'cerrada') AND fuente = 'local' AND fecha >= CURDATE()
             ORDER BY fecha ASC`
        ) as any[];

        const fechas = (rows as any[]).map(r => r.fecha as string);
        const rangos = agruparConsecutivos(fechas);

        const now = new Date();
        const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const eventos = rangos.map((r, i) => [
            'BEGIN:VEVENT',
            `UID:mht-bloqueo-${r.inicio}@mhtorremolinos.com`,
            `DTSTAMP:${dtstamp}`,
            `DTSTART;VALUE=DATE:${toIcalDate(r.inicio)}`,
            `DTEND;VALUE=DATE:${toIcalDate(r.fin)}`,
            'SUMMARY:Reserved',
            'END:VEVENT',
        ].join('\r\n'));

        const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//M&H Torremolinos//ES',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            ...eventos,
            'END:VCALENDAR',
        ].join('\r\n');

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="mhtorremolinos.ics"');
        res.send(ics);
    } catch (err) {
        console.error('[GET /api/ical/export]', err);
        res.status(500).json({ error: 'Error al generar el calendario' });
    }
});

export default router;
