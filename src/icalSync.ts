import fetch from 'node-fetch';
import ical from 'node-ical';
import { pool } from './db.js';
import { environment } from './environments/environment.js';

const THROTTLE_MS = 2 * 60 * 1000; // 2 minutos entre syncs bajo demanda
let ultimaSync: number = 0;

export function sincronizarIcalThrottled(): void {
    const ahora = Date.now();
    if (ahora - ultimaSync < THROTTLE_MS) return;
    ultimaSync = ahora;
    sincronizarIcal().catch(err => console.error('[iCal] Error en sync bajo demanda:', err));
}

const icalUrls = [
    { url: environment.icalBooking, source: 'booking', summaryFilter: 'CLOSED - Not available' },
    { url: environment.icalAirbnb, source: 'airbnb', summaryFilter: 'Reserved' },
];

// Pasamos la fecha de UTC a nuestra fecha local
function toLocalDateString(date: any) {
    return date.getFullYear() + '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
        date.getDate().toString().padStart(2, '0');
}

// Sincronizamos los calendarios de ical Booking y Airbnb con nuestro calendario interno
async function sincronizarIcal() {
    try {
        console.log('[iCal] Iniciando sincronización...');

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Poner todo booking/airbnb a disponible antes de actualizar
            await connection.query(`
        UPDATE disponibilidad
        SET estado = 'disponible', fuente = 'local'
        WHERE fuente IN ('booking', 'airbnb')
      `);

            for (const { url, source, summaryFilter } of icalUrls) {
                console.log(`[iCal] Procesando ${source}...`);

                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
                        'Accept': 'text/calendar,text/plain',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                });

                if (!res.ok) {
                    console.error(`[iCal] Error al descargar ${source}: HTTP ${res.status}`);
                    continue;
                }

                const icsText = await res.text();
                const data = ical.parseICS(icsText);

                const fechasOcupadas = [];
                for (const k in data) {
                    const ev = data[k];
                    if (ev.type === 'VEVENT' && ev.summary === summaryFilter) {
                        let start = new Date(ev.start);
                        let end = new Date(ev.end);

                        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                            const fechaStr = toLocalDateString(d);
                            fechasOcupadas.push(fechaStr);
                        }
                    }
                }

                console.log(`[iCal] ${source}: ${fechasOcupadas.length} fechas ocupadas.`);

                // Insertamos/actualizamos las fechas
                for (const fecha of fechasOcupadas) {
                    await connection.query(`
            INSERT INTO disponibilidad (fecha, estado, fuente, id_reserva)
            VALUES (?, ?, ?, NULL)
            ON DUPLICATE KEY UPDATE estado = ?, fuente = ?, actualizado = CURRENT_TIMESTAMP
          `, [fecha, source, source, source, source]);
                }
            }

            await connection.commit();
            console.log('[iCal] Sincronización completada exitosamente.');
        } catch (err) {
            await connection.rollback();
            console.error('[iCal] Error durante sincronización:', err);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('[iCal] Error general:', error);
    }
}

export { sincronizarIcal };
