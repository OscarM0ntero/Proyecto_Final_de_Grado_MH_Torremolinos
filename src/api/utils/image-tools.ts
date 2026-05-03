import sharp from 'sharp';
import path from 'path';

export async function generarThumbnail(nombreArchivo: string): Promise<string> {
    const inputPath = path.resolve('uploads', nombreArchivo);
    const nombreThumbnail = nombreArchivo.replace(/(\.[^.]+)$/, 't.webp');
    const outputPath = path.resolve('uploads', nombreThumbnail);

    await sharp(inputPath)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(outputPath);

    return nombreThumbnail;
}
