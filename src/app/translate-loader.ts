import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { isPlatformServer } from '@angular/common';

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

// Creamos el translate para poder utilizar nuestros .json de traduccion situados en /assets/i18n/
export function createTranslateLoader(http: HttpClient, platformId: Object): TranslateLoader {
    const isServer = isPlatformServer(platformId);

    const baseUrl = isServer
        ? 'https://www.mhtorremolinos.com/assets/i18n/'
        : '/assets/i18n/';

    return new TranslateHttpLoader(http, baseUrl, `.json?v=${VERSION_TRADUCCIONES}`);
}
