import { Image } from 'image-js';
import path from 'path';
import fs from 'fs/promises';

export async function generarThumbnail(nombreArchivo: string): Promise<string> {
    const inputPath = path.resolve('uploads', nombreArchivo);
    const nombreThumbnail = nombreArchivo.replace(/(\.[^.]+)$/, 't$1');
    const outputPath = path.resolve('uploads', nombreThumbnail);

    try {
        const buffer = await fs.readFile(inputPath);
        const image = await Image.load(buffer);

        const thumbnail = image.resize({ width: Math.round(image.width / 4) });

        await fs.writeFile(outputPath, await thumbnail.toBuffer());
        return nombreThumbnail;
    } catch (error) {
        console.error('❌ Error generando thumbnail con image-js:', error);
        throw error;
    }
}
