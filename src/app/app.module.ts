import { LOCALE_ID, NgModule, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay, withNoIncrementalHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideCargadorTraducciones } from './translate-loader';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

@NgModule({
	declarations: [
		AppComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		// TranslateModule desaparece en @ngx-translate 18: el servicio se registra con
		// provideTranslateService() en los providers y el pipe se importa donde se use.
		// AppComponent no traduce nada, asi que aqui no hace falta TranslatePipe.
	],
	providers: [
		// Con SSR, HttpClient sobre XHR no comparte las respuestas con el render del
		// servidor y Angular avisa de ello (NG02801); sobre fetch, las peticiones hechas
		// durante el SSR se transfieren al cliente y no se repiten al hidratar. Hasta
		// Angular 21 eso se pedia con withFetch(); en la 22 fetch ya es el backend por
		// defecto y withFetch() quedo deprecado, asi que se quita y el comportamiento es
		// el mismo. withInterceptorsFromDi() mantiene vivo el TokenInterceptor de abajo.
		provideHttpClient(withInterceptorsFromDi()),
		// Angular 21 deja de dar por defecto el scheduler de deteccion de cambios con
		// Zone.js. Va aqui, y no en main.ts, para que tambien lo reciba el arranque del
		// SSR (AppServerModule importa este modulo); si solo estuviera en main.ts, el
		// render del servidor se quedaria sin el. eventCoalescing era antes el
		// ngZoneEventCoalescing de las BootstrapOptions, ya deprecadas.
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideTranslateService(),
		...provideCargadorTraducciones(),
		provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
		provideAnimations(),
		{ provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
		{ provide: LOCALE_ID, useValue: 'es' },
		// Todos los campos usan el estilo outline (blanco con borde). Antes cada plantilla
		// tenia que pedirlo a mano y las que no lo hacian se quedaban con el relleno verde.
		{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }
	],
	bootstrap: [AppComponent]
})
export class AppModule { }