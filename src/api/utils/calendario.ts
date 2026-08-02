// Garantiza que el calendario de disponibilidad siempre cubre los próximos 12 meses.
//
// Antes esto dependía del evento MySQL `extender_calendario`, que cada día insertaba
// UN solo día (hoy + 12 meses). Ese enfoque deja huecos permanentes: si el servidor o el
// planificador de eventos está parado un día, esa fecha concreta no se crea nunca, porque
// las ejecuciones siguientes solo miran su propio "hoy + 12 meses".
//
// Esta versión es autorreparable: mira todo el rango, detecta las fechas que faltan
// (da igual cuánto tiempo llevara parado) y las crea de una vez.
import { pool } from '../../db.js';

const MESES_HORIZONTE = 12;

function formatearFechaSQL(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const d = fecha.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export async function asegurarCalendario(): Promise<void> {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fin = new Date(hoy);
        fin.setMonth(fin.getMonth() + MESES_HORIZONTE);

        const desdeSQL = formatearFechaSQL(hoy);
        const hastaSQL = formatearFechaSQL(fin);

        const [existentes] = await pool.query(
            `SELECT DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha FROM disponibilidad WHERE fecha BETWEEN ? AND ?`,
            [desdeSQL, hastaSQL]
        ) as any[];
        const yaEstan = new Set(existentes.map((r: any) => r.fecha));

        const faltan: string[] = [];
        const cursor = new Date(hoy);
        while (cursor <= fin) {
            const f = formatearFechaSQL(cursor);
            if (!yaEstan.has(f)) faltan.push(f);
            cursor.setDate(cursor.getDate() + 1);
        }

        const [[cfg]] = await pool.query(
            `SELECT valor FROM configuracion WHERE clave = 'precio_base'`
        ) as any[];
        const precioBase = parseFloat(cfg?.valor) || 150;

        // Saneado: un día sin precio no se puede vender si algún día se abre
        const [arreglados] = await pool.query(
            `UPDATE disponibilidad SET precio = ? WHERE precio IS NULL AND fecha BETWEEN ? AND ?`,
            [precioBase, desdeSQL, hastaSQL]
        ) as any[];
        if (arreglados.affectedRows > 0) {
            console.log(`[calendario] asignado precio base a ${arreglados.affectedRows} día(s) que estaban sin precio`);
        }

        if (faltan.length === 0) return;

        // Los días nuevos nacen cerrados: el administrador decide cuándo abrirlos a la venta
        const valores = faltan.map(() => '(?, ?, ?, ?)').join(', ');
        const params: any[] = [];
        for (const f of faltan) params.push(f, precioBase, 'cerrada', 'local');

        const [res] = await pool.query(
            `INSERT IGNORE INTO disponibilidad (fecha, precio, estado, fuente) VALUES ${valores}`,
            params
        ) as any[];

        if (res.affectedRows > 0) {
            console.log(`[calendario] creados ${res.affectedRows} día(s) que faltaban (hasta ${hastaSQL}, precio base ${precioBase}€)`);
        }
    } catch (err) {
        console.error('[calendario] error al asegurar el rango de fechas:', err);
    }
}
