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
            return res.json(rows);
        }

        const respuesta = rows.map((row) => ({
            id_contenido: row.id_contenido,
            pagina: row.pagina,
            titulo: row[`titulo_${idioma}`],
            texto: row[`texto_${idioma}`],
        }));
        return res.json(respuesta);
    } catch (error) {
        console.error('[ERROR /api/contenido]:', error);
        return res.status(500).json({ error: 'Error al obtener contenido' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { pagina, ...campos } = req.body;

    try {
        await pool.query(
            `UPDATE contenido
       SET titulo_es = ?, titulo_en = ?, titulo_de = ?, titulo_no = ?,
           texto_es = ?, texto_en = ?, texto_de = ?, texto_no = ?,
           pagina = ?
       WHERE id_contenido = ?`,
            [
                campos.titulo_es, campos.titulo_en, campos.titulo_de, campos.titulo_no,
                campos.texto_es, campos.texto_en, campos.texto_de, campos.texto_no,
                pagina, id
            ]
        );

        res.json({ mensaje: 'Contenido actualizado correctamente' });
    } catch (error) {
        console.error('[ERROR PUT /api/contenido/:id]:', error);
        res.status(500).json({ error: 'Error al actualizar contenido' });
    }
});


export default router;
