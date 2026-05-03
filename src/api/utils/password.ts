import crypto from 'crypto';

const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

export function generarContrasenaTemporal(): string {
    return Array.from(crypto.randomBytes(10))
        .map(b => CHARS[b % CHARS.length])
        .join('');
}

// Hashea una contraseña con SHA-256
export function hashearContrasena(plain: string): string {
    return crypto.createHash('sha256').update(plain).digest('hex');
}
