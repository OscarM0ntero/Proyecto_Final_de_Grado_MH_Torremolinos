import { LOCALE_ID, NgModule, PLATFORM_ID } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
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
		HttpClientModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: createTranslateLoader,
				deps: [HttpClient, PLATFORM_ID]
			}
		}),
	],
	providers: [
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