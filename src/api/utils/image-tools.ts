import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'path';

const execAsync = promisify(exec);

export async function generarThumbnail(nombreArchivo: string): Promise<string> {
    const inputPath = path.resolve('uploads', nombreArchivo);
    const nombreThumbnail = nombreArchivo.replace(/(\.[^.]+)$/, 't.webp');
    const outputPath = path.resolve('uploads', nombreThumbnail);

    await execAsync(`convert "${inputPath}" -resize 800x800> -quality 75 "${outputPath}"`);

    return nombreThumbnail;
}
