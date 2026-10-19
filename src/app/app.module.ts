import { LOCALE_ID, NgModule, PLATFORM_ID, TransferState } from '@angular/core';
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
				deps: [HttpClient, PLATFORM_ID, TransferState]
			}
		}),
	],
	providers: [
		// withFetch(): con SSR, HttpClient sobre XHR no comparte las respuestas con el
		// render del servidor y Angular avisa de ello (NG02801). Con fetch, las peticiones
		// hechas durante el SSR se transfieren al cliente y no se repiten al hidratar.
		// withInterceptorsFromDi() mantiene vivo el TokenInterceptor declarado abajo.
		provideHttpClient(withFetch(), withInterceptorsFromDi()),
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