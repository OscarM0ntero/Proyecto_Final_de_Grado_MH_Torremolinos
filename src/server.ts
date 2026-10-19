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
import { asegurarCalendario } from './api/utils/calendario.js';

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
import stripeRouter, { reconciliarReservasPendientes } from './api/stripe.routes.js';
import { registrarLectorTraducciones } from './app/traducciones-ssr.js';

const app = express();

// Desde Angular 20, @angular/ssr valida la cabecera Host contra una lista blanca para
// cerrar un agujero de SSRF. Esa lista empieza VACÍA: sin configurarla, *ninguna* petición
// pasa la comprobación y el motor cae a renderizado en cliente dejando un log de
// "Header host ... is not allowed" — el SSR se apaga en silencio y, según avisa el propio
// mensaje, en un major futuro pasará a devolver un 400.
//
// Los hosts van declarados en angular.json (architect > build > options > security >
// allowedHosts) y viajan en el manifiesto de la build, así que aquí no hay que repetirlos:
// el motor une esa lista con la variable de entorno NG_ALLOWED_HOSTS, que sirve para añadir
// un dominio de pruebas desde el .env sin recompilar.
//
// Apache hace de proxy inverso delante de este proceso. El valor por defecto de
// trustProxyHeaders ya acepta x-forwarded-host y x-forwarded-proto, y ese host reenviado
// se valida contra la misma lista, así que no hace falta tocarlo.
const angularApp = new AngularNodeAppEngine();

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const rootFolder = path.resolve(serverDistFolder, '..');
const browserDistFolder = resolve(serverDistFolder, '../browser');

// Traducciones para el SSR: se leen del disco, no por HTTP.
//
// Antes el render del servidor pedía los .json a https://www.mhtorremolinos.com/assets/i18n/,
// o sea que el servidor salía a la red pública contra sí mismo en cada página: lento, y si el
// dominio no respondía el HTML salía sin traducir. Los ficheros están aquí al lado, en
// dist/web-apartamento/browser/assets/i18n/, así que se leen de disco y se cachean en memoria.
const carpetaTraducciones = path.join(browserDistFolder, 'assets/i18n');
const traduccionesEnMemoria = new Map<string, Record<string, unknown> | null>();

registrarLectorTraducciones((idioma) => {
	// El idioma lo decide la aplicación ('es', 'en', 'de', 'no'), pero nunca se construye una
	// ruta con algo que no sea un código de dos letras.
	if (!/^[a-z]{2}$/.test(idioma)) return null;

	if (!traduccionesEnMemoria.has(idioma)) {
		const fichero = path.join(carpetaTraducciones, `${idioma}.json`);
		try {
			traduccionesEnMemoria.set(idioma, JSON.parse(fs.readFileSync(fichero, 'utf-8')));
		} catch (error) {
			console.error(`[SSR] No se pudo leer ${fichero}:`, error);
			traduccionesEnMemoria.set(idioma, null);
		}
	}

	return traduccionesEnMemoria.get(idioma) ?? null;
});

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

// Stripe se monta antes del parser JSON: el webhook necesita el body en crudo para verificar la firma
app.use('/api/stripe', stripeRouter);

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



// Los ficheros de idioma NO llevan hash en el nombre, al contrario que los bundles, así que
// con el año de caché del resto de estáticos un visitante que ya hubiera entrado se quedaba
// con la versión antigua y no veía ninguna traducción nueva. Peor aún: como defaultLanguage
// es 'es', las claves que faltaban caían en silencio al español en vez de fallar a la vista.
// Con no-cache el navegador revalida y el ETag hace que casi siempre sea un 304 vacío.
app.use('/assets/i18n', express.static(path.join(browserDistFolder, 'assets/i18n'), {
	setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache'),
	index: false,
	redirect: false,
}));

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

	// Reconciliación con Stripe: recupera los pagos cuyo webhook no llegó (servidor caído, etc.)
	const INTERVALO_RECONCILIACION_MS = 15 * 60 * 1000; // 15 minutos
	reconciliarReservasPendientes();
	setInterval(reconciliarReservasPendientes, INTERVALO_RECONCILIACION_MS);

	// Calendario: rellena los días que falten hasta 12 meses vista (autorreparable)
	const INTERVALO_CALENDARIO_MS = 6 * 60 * 60 * 1000; // 6 horas
	asegurarCalendario();
	setInterval(asegurarCalendario, INTERVALO_CALENDARIO_MS);
}

export const reqHandler = createNodeRequestHandler(app);
