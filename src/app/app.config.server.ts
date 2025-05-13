import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRoutesConfig } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';

export const config: ApplicationConfig = {
    providers: [
        provideServerRendering(),
        provideServerRoutesConfig(serverRoutes)
    ]
};
