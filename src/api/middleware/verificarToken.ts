import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { secret } from '../../db.js';

interface RequestConUsuario extends Request {
    usuario?: {
        id: number;
        rol: string;
        nombre?: string;
        [key: string]: any;
    };
}

export function verificarToken(req: RequestConUsuario, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Falta token de autorización' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, secret!);

        if (typeof decoded === 'string') {
            return res.status(401).json({ error: 'Token inválido' });
        }

        req.usuario = decoded as RequestConUsuario['usuario'];

        next();
        return;
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}
