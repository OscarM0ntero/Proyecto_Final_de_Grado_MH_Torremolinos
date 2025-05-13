import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();
const idiomasPermitidos = ['es', 'en', 'de', 'no'];

router.get('/', async (req, res) => {
    const { lang, pagina } = req.query;

    if (!pagina) {
        return res.status(400).json({ error: 'Falta parámetro: pagina' });
    }

    const idioma = String(lang);

    if (lang && !idiomasPermitidos.includes(idioma)) {
        return res.status(400).json({
            error: `Idioma no válido: ${idioma}`,
            idiomas_validos: idiomasPermitidos
        });
    }

    try {
        const [rows]: [any[], any] = await pool.query(
            'SELECT * FROM contenido WHERE pagina = ?',
            [pagina]
        );

        if (!lang) {
            console.log(rows);
            return res.json(rows);
        }

        const respuesta = rows.map((row) => ({
            id_contenido: row.id_contenido,
            pagina: row.pagina,
            titulo: row[`titulo_${idioma}`],
            texto: row[`texto_${idioma}`],
        }));
        console.log(respuesta);
        return res.json(respuesta);
    } catch (error) {
        console.error('[ERROR /api/contenido]:', error);
        return res.status(500).json({ error: 'Error al obtener contenido' });
    }
});

export default router;
