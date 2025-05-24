import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse
} from '@angular/ssr/node';

import contenidoRouter from './api/contenido.routes.js';
import disponibilidadRoutes from './api/disponibilidad.routes.js';
import loginRouter from './api/login.routes.js';
import usuariosRouter from './api/usuarios.routes.js';
import reservasRouter from './api/reservas.routes.js';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

console.log('[SSR] Cargando rutas backend...');

// ✅ Middleware para leer JSON del body
app.use(express.json());

// ✅ Rutas backend
app.use('/api/contenido', contenidoRouter);
app.use('/api/disponibilidad', disponibilidadRoutes);
app.use('/api/login', loginRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/reservas', reservasRouter);


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
    console.log(`[SSR] Servidor escuchando en http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
