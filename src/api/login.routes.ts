import express from 'express';
import { pool, secret } from '../db.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/', async (req, res) => {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
        return res.status(400).json({ error: 'Faltan campos' });
    }

    try {
        const hash = hashPassword(contrasena);

        const [usuarios] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ? AND contrasena = ?',
            [email, hash]
        ) as any[];

        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = usuarios[0];

        const token = jwt.sign({
            id: usuario.id_usuario,
            rol: usuario.rol,
            nombre: usuario.nombre
        }, secret!, { expiresIn: '2h' });

        res.json({ token });

    } catch (err) {
        return res.status(500).json({ error: 'Error en el servidor' });
    }

    return;
});

export default router;
