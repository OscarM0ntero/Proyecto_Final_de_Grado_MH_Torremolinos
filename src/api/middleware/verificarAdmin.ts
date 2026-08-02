// Exige token válido Y rol de administrador.
// Usar en cualquier endpoint que modifique el sitio o exponga datos de clientes.
import { Request, Response, NextFunction } from 'express';
import { verificarToken } from './verificarToken.js';

export function verificarAdmin(req: Request, res: Response, next: NextFunction) {
    verificarToken(req, res, () => {
        const usuario = (req as any).usuario;
        if (usuario?.rol !== 'administrador') {
            return res.status(403).json({ error: 'Acceso denegado' });
        }
        return next();
    });
}
