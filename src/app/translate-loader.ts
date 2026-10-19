import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { isPlatformServer } from '@angular/common';
import { StateKey, TransferState, makeStateKey } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { obtenerLectorTraducciones } from './traducciones-ssr';

// Los .json de traducción no llevan hash en el nombre, al contrario que los bundles, así que
// una vez cacheados el navegador los reutiliza sin volver a preguntar y no llega ninguna
// traducción nueva. Peor aún: con defaultLanguage 'es', las claves que faltan caen en silencio
// al español en vez de fallar a la vista, así que el problema pasa desapercibido.
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

// Creamos el translate para poder utilizar nuestros .json de traduccion situados en /assets/i18n/
export function createTranslateLoader(
	http: HttpClient,
	platformId: Object,
	transferState: TransferState
): TranslateLoader {
	const isServer = isPlatformServer(platformId);

	const baseUrl = isServer
		? 'https://www.mhtorremolinos.com/assets/i18n/'
		: '/assets/i18n/';

	const porRed = new TranslateHttpLoader(http, baseUrl, `.json?v=${VERSION_TRADUCCIONES}`);

	return isServer
		? new TraduccionesDeDisco(transferState, porRed)
		: new TraduccionesDelNavegador(transferState, porRed);
}
