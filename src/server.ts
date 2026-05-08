import express from 'express';
import path, { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import {
	AngularNodeAppEngine,
	createNodeRequestHandler,
	isMainModule,
	writeResponseToNodeResponse
} from '@angular/ssr/node';

import { sincronizarIcal } from './icalSync.js';

import contenidoRouter from './api/contenido.routes.js';
import disponibilidadRoutes from './api/disponibilidad.routes.js';
import loginRouter from './api/login.routes.js';
import usuariosRouter from './api/usuarios.routes.js';
import reservasRouter from './api/reservas.routes.js';
import imagenesRouter from './api/imagenes.routes.js';
import contactRouter from './api/contact.routes.js';
import icalRouter from './api/ical.routes.js';
import configuracionRouter from './api/configuracion.routes.js';
import resenasRouter from './api/resenas.routes.js';

const app = express();
const angularApp = new AngularNodeAppEngine();

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const rootFolder = path.resolve(serverDistFolder, '..');
const browserDistFolder = resolve(serverDistFolder, '../browser');

// Si se pide un thumbnail .jpg/.png y existe la versión .webp, la sirve en su lugar
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', (req, res, next) => {
    if (req.path.match(/t\.(jpg|jpeg|png)$/i)) {
        const webpPath = path.join(uploadsDir, req.path.replace(/\.[^.]+$/, '.webp'));
        if (fs.existsSync(webpPath)) {
            res.set('Content-Type', 'image/webp');
            res.set('Cache-Control', 'public, max-age=2592000');
            return res.sendFile(webpPath);
        }
    }
    next();
});

app.use('/uploads', express.static(uploadsDir, {
    maxAge: '30d',
    immutable: false
}));

// Middleware para leer json del body
app.use(express.json());

// Rutas backend
app.use('/api/contenido', contenidoRouter);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/login', loginRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/reservas', reservasRouter);
app.use('/api/imagenes', imagenesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/ical', icalRouter);
app.use('/api/configuracion', configuracionRouter);
app.use('/api/resenas', resenasRouter);



// Archivos estáticos del navegador
app.use(express.static(browserDistFolder, {
	maxAge: '1y',
	index: false,
	redirect: false,
}));

// Logger para peticiones
app.use((req, res, next) => {
	console.log('[SSR] Petición recibida:', req.url);
	next();
});

// SSR handler
app.use('/**', (req, res, next) => {
	angularApp
		.handle(req)
		.then(response =>
			response ? writeResponseToNodeResponse(response, res) : next()
		)
		.catch(next);
});


// Inicio del servidor
if (isMainModule(import.meta.url)) {
	const port = process.env['PORT'] || 4000;
	app.listen(port, () => {
		console.log(`[SSR] Servidor escuchando en puerto ${port}`);
	});

	// Sincronización iCal en segundo plano, independiente de las visitas
	const INTERVALO_ICAL_MS = 15 * 60 * 1000; // 15 minutos
	sincronizarIcal(); // ejecución inicial al arrancar
	setInterval(sincronizarIcal, INTERVALO_ICAL_MS);
}

export const reqHandler = createNodeRequestHandler(app);
