import { PLATFORM_ID, Provider, StateKey, TransferState, inject, makeStateKey } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { TranslateLoader, TranslationObject, provideTranslateLoader } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Observable, of, tap } from 'rxjs';
import { obtenerLectorTraducciones } from './traducciones-ssr';

// Los .json de traducción no llevan hash en el nombre, al contrario que los bundles, así que
// una vez cacheados el navegador los reutiliza sin volver a preguntar y no llega ninguna
// traducción nueva. Peor aún: con el idioma de respaldo en 'es', las claves que faltan caen en
// silencio al español en vez de fallar a la vista, así que el problema pasa desapercibido.
//
// La cabecera no-cache del servidor solo sirve para quien descargue el fichero a partir de
// ahora; a quien ya lo tenga guardado con la caducidad antigua no le afecta. Por eso se versiona
// la URL: al cambiar VERSION_TRADUCCIONES la ruta es otra, no hay copia previa de ella y todo el
// mundo se la descarga de nuevo.
//
// SUBIR ESTE NÚMERO CADA VEZ QUE SE TOQUEN LOS FICHEROS DE IDIOMA.
const VERSION_TRADUCCIONES = '2';

function claveTransferencia(idioma: string): StateKey<TranslationObject> {
	return makeStateKey<TranslationObject>(`i18n-${idioma}`);
}

/**
 * Carga en el servidor. Lee los ficheros del disco (sin salir a la red) y los deja en el
 * TransferState, que viaja dentro del HTML: al hidratar, el navegador ya tiene las traducciones
 * del idioma por defecto y no hay un instante en el que se vean las claves en crudo.
 */
class TraduccionesDeDisco implements TranslateLoader {
	constructor(
		private transferState: TransferState,
		private respaldoPorRed: TranslateLoader
	) { }

	getTranslation(idioma: string): Observable<TranslationObject> {
		const lector = obtenerLectorTraducciones();
		const traducciones = lector?.(idioma) as TranslationObject | null | undefined;

		if (!traducciones) {
			// Sin lector registrado, o con el fichero ilegible, no dejamos la página sin
			// traducir: se piden por red como se hacía antes. Es lento, pero es el último
			// recurso y no debería ocurrir arrancando desde src/server.ts.
			console.warn(`[SSR] Sin traducciones en disco para "${idioma}"; se piden por red.`);
			return this.respaldoPorRed.getTranslation(idioma).pipe(
				tap(cargadas => this.transferState.set(claveTransferencia(idioma), cargadas))
			);
		}

		this.transferState.set(claveTransferencia(idioma), traducciones);
		return of(traducciones);
	}
}

/**
 * Carga en el navegador. Si el idioma viene ya en el HTML (el que pintó el SSR) se usa tal cual,
 * de forma síncrona; cualquier otro —el visitante cambia de idioma, o su navegador está en otro—
 * se descarga de /assets/i18n/ como siempre.
 */
class TraduccionesDelNavegador implements TranslateLoader {
	constructor(
		private transferState: TransferState,
		private porRed: TranslateLoader
	) { }

	getTranslation(idioma: string): Observable<TranslationObject> {
		const clave = claveTransferencia(idioma);
		if (this.transferState.hasKey(clave)) {
			// No se borra la clave: hay dos TranslateService (el de AppModule y el de WebModule)
			// y cualquiera de los dos puede pedir el mismo idioma.
			return of(this.transferState.get(clave, {} as TranslationObject));
		}
		return this.porRed.getTranslation(idioma);
	}
}

/**
 * Providers del cargador de traducciones.
 *
 * En @ngx-translate 18 ya no hay factoría con `deps`: el TranslateLoader se registra con
 * provideTranslateLoader() y el TranslateHttpLoader no se construye con argumentos
 * (`new TranslateHttpLoader(http, prefijo, sufijo)`), sino que se instancia por inyección y
 * lee su configuración del token TRANSLATE_HTTP_LOADER_CONFIG. Como el prefijo depende de la
 * plataforma, ese token se provee con useFactory en vez de usar el
 * provideTranslateHttpLoader() de la librería, que solo admite un valor fijo.
 */
export function provideCargadorTraducciones(): Provider[] {
	return [
		{
			provide: TRANSLATE_HTTP_LOADER_CONFIG,
			useFactory: () => {
				// En el servidor esto es solo el respaldo de TraduccionesDeDisco: si llega a
				// usarse no hay origen relativo que resolver, así que la ruta ha de ser absoluta.
				const enServidor = isPlatformServer(inject(PLATFORM_ID));

				return {
					resources: [{
						prefix: enServidor
							? 'https://www.mhtorremolinos.com/assets/i18n/'
							: '/assets/i18n/',
						suffix: `.json?v=${VERSION_TRADUCCIONES}`,
					}],
					enforceLoading: false,
					useHttpBackend: false,
					// La v18 cambió el comportamiento por defecto: un 404 pasa a devolver {} con
					// un console.warn, de modo que la página se queda a medio traducir sin que
					// nada falle. Con failOnError se mantiene el de la v16: si el fichero de
					// idioma no está, la carga falla y se ve.
					failOnError: true,
				};
			},
		},
		provideTranslateLoader(() => {
			const transferState = inject(TransferState);
			const enServidor = isPlatformServer(inject(PLATFORM_ID));
			// El constructor de TranslateHttpLoader llama a inject() por dentro, y esta factoría
			// corre en contexto de inyección, así que puede instanciarse aquí sin pasarle nada.
			const porRed = new TranslateHttpLoader();

			return enServidor
				? new TraduccionesDeDisco(transferState, porRed)
				: new TraduccionesDelNavegador(transferState, porRed);
		}),
	];
}
