import express from 'express';
import path, { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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

const app = express();
const angularApp = new AngularNodeAppEngine();

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const rootFolder = path.resolve(serverDistFolder, '..');
const browserDistFolder = resolve(serverDistFolder, '../browser');

// Configuramos la carpeta uploads para subir y mostrar imagenes
app.use('/uploads', express.static(path.join(rootFolder, 'uploads')));

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
let ultimaSincronizacion = 0;
const TIEMPO_ENTRE_SINCRONIZACIONES_MS = 1 * 60 * 1000; // 1 minutos

// Cada vez que un usuario accede a la web, comprobamos si el calendario esta actualizado y sincrinizado con Booking y Airbnb
app.use('/**', async (req, res, next) => {
	try {
		const ahora = Date.now();
		if (ahora - ultimaSincronizacion > TIEMPO_ENTRE_SINCRONIZACIONES_MS) {
			console.log('[SSR] Sincronizando calendario...');
			await sincronizarIcal();
			ultimaSincronizacion = ahora;
		} else {
			console.log('[SSR] Sincronización reciente, no se actualiza.');
		}
	} catch (err) {
		console.error('[SSR] Error sincronizando calendario:', err);
	}

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
}

export const reqHandler = createNodeRequestHandler(app);
