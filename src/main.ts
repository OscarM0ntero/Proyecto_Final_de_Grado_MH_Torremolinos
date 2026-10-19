import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// Desde Angular 21 el scheduler de deteccion de cambios con Zone.js ya no viene por
// defecto. Se pide con provideZoneChangeDetection(), y esta en los providers de AppModule
// y no aqui para que lo reciban los dos arranques: el del navegador y el del SSR, que
// entra por AppServerModule. El eventCoalescing que antes se pasaba como
// ngZoneEventCoalescing en las BootstrapOptions es ahora una opcion suya.
platformBrowser().bootstrapModule(AppModule)
	.catch(err => console.error(err));

// Configuramos la informacion local como España
registerLocaleData(localeEs, 'es');
