import crypto from 'crypto';

// Devuelve una contraseña simple de 6 dígitos
export function generarContrasenaTemporal(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hashea una contraseña con SHA-256
export function hashearContrasena(plain: string): string {
    return crypto.createHash('sha256').update(plain).digest('hex');
}
