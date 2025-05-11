import { Router } from 'express';
import { pool } from '../db.js';

console.log('[API] contenido.routes.ts incluido');

const router = Router();

router.get('/contenido', async (req, res) => {
  const lang = String(req.query['lang'] || 'es').toLowerCase();
  const pagina = String(req.query['pagina'] || '').toLowerCase();

  const idiomas = ['es', 'en', 'de', 'no'];
  if (!idiomas.includes(lang)) return res.status(400).json({ error: 'Idioma inválido' });
  if (!pagina) return res.status(400).json({ error: 'Falta el parámetro "pagina"' });

  const campoTitulo = `titulo_${lang}`;
  const campoTexto = `texto_${lang}`;

  try {
    const [rows] = await pool.query(
      `SELECT id_contenido, ?? AS titulo, ?? AS texto FROM contenido WHERE pagina = ?`,
      [campoTitulo, campoTexto, pagina]
    );
    return res.json(rows);
  } catch (error) {
    console.error('[ERROR /api/contenido]:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
