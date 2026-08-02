import express from 'express';
import crypto from 'node:crypto';
import { pool, secret } from '../db.js';

const router = express.Router();

const ORGANIZER = 'mailto:info@mhtorremolinos.com';

// UID opaco y estable por reserva.
// NO se usa `token_acceso` directamente: este feed es público (lo leen Booking y Airbnb) y ese
// token permite ver y CANCELAR la reserva. Se publica un hash con el secreto del servidor, que
// es igual de estable pero no se puede revertir.
function uidReserva(idReserva: number): string {
    const hash = crypto.createHash('sha256').update(`reserva:${idReserva}:${secret}`).digest('hex');
    return `${hash.slice(0, 32)}@mhtorremolinos.com`;
}

function toIcalDate(dateStr: string): string {
    return dateStr.replace(/-/g, '');
}

// RFC 5545 §3.1: fold lines longer than 75 octets
function foldLine(line: string): string {
    if (line.length <= 75) return line;
    let result = line.slice(0, 75);
    let pos = 75;
    while (pos < line.length) {
        result += '\r\n ' + line.slice(pos, pos + 74);
        pos += 74;
    }
    return result;
}

function buildVEvent(fields: Record<string, string>): string {
    const lines = ['BEGIN:VEVENT'];
    for (const [key, value] of Object.entries(fields)) {
        lines.push(foldLine(`${key}:${value}`));
    }
    lines.push('END:VEVENT');
    return lines.join('\r\n');
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

async function generarIcs(res: express.Response, incluirCerrados: boolean, nombreFichero: string) {
    try {
        // 1. Reservas confirmadas desde la tabla reservas (UIDs estables por id_reserva)
        const [reservasRows] = await pool.query(
            `SELECT r.id_reserva,
                    DATE_FORMAT(r.fecha_inicio, '%Y-%m-%d') AS fecha_inicio,
                    DATE_FORMAT(r.fecha_fin,    '%Y-%m-%d') AS fecha_fin,
                    r.fecha_creacion
             FROM reservas r
             WHERE r.estado_reserva = 'Confirmada' AND r.fecha_fin >= CURDATE()
             ORDER BY r.fecha_inicio ASC`
        ) as any[];

        // 2. Días cerrados manualmente por admin (no vinculados a una reserva)
        const [cerradasRows] = incluirCerrados
            ? await pool.query(
                `SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha
                 FROM disponibilidad
                 WHERE estado = 'cerrada' AND fecha >= CURDATE()
                 ORDER BY fecha ASC`
            ) as any[]
            : [[]];

        const now = new Date();
        const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const eventos: string[] = [];

        // Eventos de reservas confirmadas
        for (const r of reservasRows as any[]) {
            const created = new Date(r.fecha_creacion)
                .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

            eventos.push(buildVEvent({
                'UID': uidReserva(r.id_reserva),
                'DTSTAMP': dtstamp,
                'DTSTART;VALUE=DATE': toIcalDate(r.fecha_inicio),
                'DTEND;VALUE=DATE': toIcalDate(r.fecha_fin),
                'SUMMARY': 'CLOSED - Not available',
                'ORGANIZER': ORGANIZER,
                'CREATED': created,
            }));
        }

        // Eventos de días cerrados por admin, agrupados en rangos
        const fechasCerradas = (cerradasRows as any[]).map((r: any) => r.fecha as string);
        for (const rango of agruparConsecutivos(fechasCerradas)) {
            eventos.push(buildVEvent({
                'UID': `mht-cerrado-${rango.inicio}@mhtorremolinos.com`,
                'DTSTAMP': dtstamp,
                'DTSTART;VALUE=DATE': toIcalDate(rango.inicio),
                'DTEND;VALUE=DATE': toIcalDate(rango.fin),
                'SUMMARY': 'CLOSED - Not available',
                'ORGANIZER': ORGANIZER,
            }));
        }

        const ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//M&H Torremolinos//mhtorremolinos.com//ES',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            ...eventos,
            'END:VCALENDAR',
        ].join('\r\n');

        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreFichero}"`);
        res.send(ics);
    } catch (err) {
        console.error('[GET /api/ical/export]', err);
        res.status(500).json({ error: 'Error al generar el calendario' });
    }
}

// Calendario completo: reservas + días cerrados manualmente (el que ya usaban Booking/Airbnb)
router.get('/export', (_req, res) => generarIcs(res, true, 'mhtorremolinos.ics'));

// Solo reservas confirmadas, sin los días que el administrador cerró a mano
router.get('/export/reservas', (_req, res) => generarIcs(res, false, 'mhtorremolinos-reservas.ics'));

export default router;
