import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '..', 'uploads');

const esOriginal = nombre =>
    !nombre.match(/t\.(jpg|jpeg|png|webp)$/i) &&
    nombre.match(/\.(jpg|jpeg|png)$/i);

async function regenerar() {
    const archivos = await fs.readdir(uploadsDir);
    const originales = archivos.filter(esOriginal);

    console.log(`Encontradas ${originales.length} imágenes originales.`);

    let ok = 0, err = 0;

    for (const archivo of originales) {
        const inputPath = path.join(uploadsDir, archivo);
        const thumbnailNombre = archivo.replace(/(\.[^.]+)$/, 't.webp');
        const outputPath = path.join(uploadsDir, thumbnailNombre);

        try {
            await sharp(inputPath)
                .resize({ width: 800, withoutEnlargement: true })
                .webp({ quality: 75 })
                .toFile(outputPath);
            console.log(`✓ ${archivo} → ${thumbnailNombre}`);
            ok++;
        } catch (e) {
            console.error(`✗ ${archivo}: ${e.message}`);
            err++;
        }
    }

    console.log(`\nCompletado: ${ok} OK, ${err} errores.`);
}

regenerar();
