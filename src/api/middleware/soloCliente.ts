import { Request, Response, NextFunction } from 'express';

export function soloCliente(req: Request, res: Response, next: NextFunction) {
    if (req.usuario?.rol !== 'cliente') {
        return res.status(403).json({ error: 'Acceso solo para clientes' });
    }

    next();
    return;
}
