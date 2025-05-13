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

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

console.log('[SSR] Cargando rutas backend...');
app.use('/api/contenido', contenidoRouter); // 👈 aquí se activa tu API
app.use('/api/disponibilidad', disponibilidadRoutes);


app.use(express.static(browserDistFolder, {
  maxAge: '1y',
  index: false,
  redirect: false,
}));

app.use((req, res, next) => {
  console.log('[SSR] Petición recibida:', req.url);
  next();
});

app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then(response =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`[SSR] Servidor escuchando en http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
