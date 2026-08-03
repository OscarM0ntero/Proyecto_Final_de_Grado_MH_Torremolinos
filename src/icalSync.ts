import fetch from 'node-fetch';
import ical from 'node-ical';
import { pool } from './db.js';
import { environment } from './environments/environment.js';
import { enviarCorreo } from './api/utils/mailer.js';
import { plantillaEmail } from './api/utils/emailTemplate.js';

const adminEmails = ['info@mhtorremolinos.com', 'mhtorremolinos@gmail.com'];

// Colisiones ya avisadas, para no repetir el email en cada sync (cada 15 min).
// Se vacía al reiniciar el servidor, así que como mucho se avisa una vez por arranque.
const colisionesAvisadas = new Set<string>();

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

                if (fechasOcupadas.length > 0) {
                    // Las fechas que aún no existían se crean con el precio base: si quedaran a NULL
                    // no se podrían poner a la venta cuando el bloqueo externo desaparezca.
                    const [[cfgPrecio]] = await connection.query(
                        `SELECT valor FROM configuracion WHERE clave = 'precio_base'`
                    ) as any[];
                    const precioBase = parseFloat(cfgPrecio?.valor) || 150;

                    // Un bloqueo externo NUNCA debe pisar un día ya vendido por nosotros: eso ocurre
                    // cuando alguien reserva en Booking y en la web casi a la vez (entre syncs), y
                    // antes se sobrescribía en silencio, dejando dos reservas para las mismas fechas.
                    const marcadores = fechasOcupadas.map(() => '?').join(',');
                    const [vendidas] = await connection.query(
                        `SELECT DATE_FORMAT(d.fecha, '%Y-%m-%d') AS fecha, d.id_reserva,
                                r.cliente_nombre, r.cliente_apellidos, r.cliente_email
                         FROM disponibilidad d
                         JOIN reservas r ON r.id_reserva = d.id_reserva
                         WHERE d.fecha IN (${marcadores}) AND d.estado = 'reservada'
                           AND r.estado_reserva = 'Confirmada'`,
                        fechasOcupadas
                    ) as any[];

                    const enConflicto = new Set(vendidas.map((v: any) => v.fecha));
                    const importables = fechasOcupadas.filter(f => !enConflicto.has(f));

                    if (importables.length > 0) {
                        const placeholders = importables.map(() => '(?, ?, ?, ?, NULL)').join(', ');
                        const values = importables.flatMap(f => [f, precioBase, source, source]);
                        await connection.query(`
                            INSERT INTO disponibilidad (fecha, precio, estado, fuente, id_reserva)
                            VALUES ${placeholders}
                            ON DUPLICATE KEY UPDATE estado = VALUES(estado), fuente = VALUES(fuente), actualizado = CURRENT_TIMESTAMP
                        `, values);
                    }

                    if (vendidas.length > 0) {
                        await avisarColision(source, vendidas);
                    }
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


// Avisa a los administradores de que un canal externo bloquea días que ya tenemos vendidos.
// El día se mantiene como nuestro: es el administrador quien decide qué reserva cancelar.
async function avisarColision(source: string, vendidas: any[]): Promise<void> {
    const porReserva = new Map<number, { nombre: string; email: string; fechas: string[] }>();
    for (const v of vendidas) {
        if (!porReserva.has(v.id_reserva)) {
            porReserva.set(v.id_reserva, {
                nombre: `${v.cliente_nombre || ''} ${v.cliente_apellidos || ''}`.trim(),
                email: v.cliente_email,
                fechas: []
            });
        }
        porReserva.get(v.id_reserva)!.fechas.push(v.fecha);
    }

    for (const [idReserva, datos] of porReserva) {
        const clave = `${source}:${idReserva}:${datos.fechas.sort().join(',')}`;
        if (colisionesAvisadas.has(clave)) continue;
        colisionesAvisadas.add(clave);

        console.warn(`[iCal] CONFLICTO: ${source} bloquea días ya vendidos de la reserva #${idReserva}: ${datos.fechas.join(', ')}`);

        const filas = datos.fechas.map(f => `<li>${f}</li>`).join('');
        for (const admin of adminEmails) {
            await enviarCorreo(admin, `Conflicto de fechas con ${source} — reserva #${idReserva}`, plantillaEmail(`
                <h2 style="margin:0 0 8px;font-family:Georgia,serif;color:#3F4B3A;font-size:20px;">Posible doble reserva</h2>
                <p style="margin:0 0 14px;color:#555;font-size:15px;">
                    <strong>${source}</strong> ha bloqueado fechas que ya tenemos vendidas en la web con la
                    reserva <strong>#${idReserva}</strong> (${datos.nombre}, ${datos.email}).
                </p>
                <ul style="margin:0 0 14px;color:#555;font-size:15px;">${filas}</ul>
                <p style="margin:0 0 14px;color:#555;font-size:15px;">
                    Los días se han mantenido asignados a nuestra reserva; el bloqueo externo NO se ha importado.
                    Hay que decidir qué reserva se conserva: si se cancela la nuestra desde el panel, se reembolsa
                    automáticamente al huésped.
                </p>
                <p style="margin:0;font-size:13px;color:#999;">Este aviso solo se envía una vez por conflicto.</p>
            `));
        }
    }
}
