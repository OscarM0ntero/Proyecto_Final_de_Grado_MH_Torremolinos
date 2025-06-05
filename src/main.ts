import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { provideAnimations } from '@angular/platform-browser/animations'; // Importar provideAnimations para p-galleria
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

platformBrowser().bootstrapModule(AppModule, {
	ngZoneEventCoalescing: true,
	providers: [provideAnimations()]
})
	.catch(err => console.error(err));

// Configuramos la informacion local como España
registerLocaleData(localeEs, 'es');
