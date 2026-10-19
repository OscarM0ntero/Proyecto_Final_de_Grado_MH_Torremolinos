import { PLATFORM_ID, Provider, inject } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { provideTranslateLoader } from '@ngx-translate/core';
import { TRANSLATE_HTTP_LOADER_CONFIG, TranslateHttpLoader } from '@ngx-translate/http-loader';

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

/**
 * Providers del cargador de traducciones (/assets/i18n/).
 *
 * En @ngx-translate 18 el TranslateHttpLoader ya no se construye a mano con
 * `new TranslateHttpLoader(http, prefijo, sufijo)`: se instancia por inyección y lee su
 * configuración del token TRANSLATE_HTTP_LOADER_CONFIG. Como el prefijo depende de la
 * plataforma, se provee con useFactory en vez del provideTranslateHttpLoader() de la
 * librería, que solo admite un valor fijo.
 */
export function provideCargadorTraducciones(): Provider[] {
	return [
		{
			provide: TRANSLATE_HTTP_LOADER_CONFIG,
			useFactory: () => {
				// En el servidor no hay origen relativo que resolver, así que la ruta tiene que
				// ser absoluta; en el navegador se pide al propio dominio.
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
		provideTranslateLoader(TranslateHttpLoader),
	];
}
