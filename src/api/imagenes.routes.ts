import express, { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { pool } from '../db.js';
import path from 'path';
import { generarThumbnail } from './utils/image-tools.js';
import fs from 'fs/promises';

const router = express.Router();

// Configura multer para guardar archivos en /src/api/uploads
const uploadPath = path.resolve('uploads');

const storage = multer.diskStorage({
    destination: uploadPath,
    filename: (req: Request, file: Express.Multer.File, cb) => {
        const ext = path.extname(file.originalname);
        const name = Date.now() + '-' + file.originalname.replace(/\s/g, '');
        cb(null, name);
    }
});

const upload = multer({ storage });

// GET /api/imagenes?pagina=gallery
router.get('/', async (req, res) => {
    const { pagina } = req.query;
    const [rows] = await pool.query(
        'SELECT * FROM imagenes WHERE pagina = ? ORDER BY orden ASC',
        [pagina]
    );
    console.log(rows);
    res.json(rows);
});

// POST /api/imagenes
router.post('/', upload.single('imagen'), async (req, res) => {
    const { alt, orden, pagina } = req.body;
    const imagen = req.file;

    if (!imagen || !pagina) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const url = imagen.filename;

    try {
        const url_thumbnail = await generarThumbnail(url);
        await pool.query(
            'INSERT INTO imagenes (url, url_thumbnail, alt, orden, pagina) VALUES (?, ?, ?, ?, ?)',
            [url, url_thumbnail, alt || '', orden || 0, pagina]
        );
        return res.json({ mensaje: 'Imagen subida correctamente' });
    } catch (error) {
        console.error('Error al generar thumbnail:', error);
        return res.status(500).json({ error: 'No se pudo generar el thumbnail' });
    }
});



// DELETE /api/imagenes/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    const [rawRows] = await pool.query('SELECT url, url_thumbnail FROM imagenes WHERE id = ?', [id]);
    const rows = rawRows as Array<{ url: string, url_thumbnail: string | null }>;

    if (!rows.length) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const { url, url_thumbnail } = rows[0];
    const imagePath = path.resolve('uploads', url);
    const thumbPath = path.resolve('uploads', url_thumbnail || '');

    try {
        await fs.unlink(imagePath);
        console.log(`🗑 Imagen eliminada: ${imagePath}`);

        if (url_thumbnail) {
            await fs.unlink(thumbPath);
            console.log(`🗑 Thumbnail eliminado: ${thumbPath}`);
        }
    } catch (err) {
        console.error('Error al borrar archivos físicos:', err);
    }

    await pool.query('DELETE FROM imagenes WHERE id = ?', [id]);
    return res.json({ mensaje: 'Imagen eliminada correctamente' });
});




export default router;
