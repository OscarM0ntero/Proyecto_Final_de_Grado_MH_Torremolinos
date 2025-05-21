import { Request, Response, NextFunction } from 'express';

export function soloAdmin(req: Request, res: Response, next: NextFunction) {
    if (req.usuario?.rol !== 'administrador') {
        return res.status(403).json({ error: 'Acceso solo para administradores' });
    }

    next();
    return;
}
