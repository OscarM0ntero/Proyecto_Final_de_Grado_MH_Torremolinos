import { LOCALE_ID, NgModule, PLATFORM_ID, provideZoneChangeDetection } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { createTranslateLoader } from './translate-loader';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

@NgModule({
	declarations: [
		AppComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: createTranslateLoader,
				deps: [HttpClient, PLATFORM_ID]
			}
		}),
	],
	providers: [
		// withFetch(): con SSR, HttpClient sobre XHR no comparte las respuestas con el
		// render del servidor y Angular avisa de ello (NG02801). Con fetch, las peticiones
		// hechas durante el SSR se transfieren al cliente y no se repiten al hidratar.
		// withInterceptorsFromDi() mantiene vivo el TokenInterceptor declarado abajo.
		provideHttpClient(withFetch(), withInterceptorsFromDi()),
		// Angular 21 deja de dar por defecto el scheduler de deteccion de cambios con
		// Zone.js. Va aqui, y no en main.ts, para que tambien lo reciba el arranque del
		// SSR (AppServerModule importa este modulo); si solo estuviera en main.ts, el
		// render del servidor se quedaria sin el. eventCoalescing era antes el
		// ngZoneEventCoalescing de las BootstrapOptions, ya deprecadas.
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideClientHydration(withEventReplay()),
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