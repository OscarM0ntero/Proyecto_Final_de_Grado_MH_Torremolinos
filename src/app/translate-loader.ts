import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { isPlatformServer } from '@angular/common';

// Creamos el translate para poder utilizar nuestros .json de traduccion situados en /assets/i18n/
export function createTranslateLoader(http: HttpClient, platformId: Object): TranslateLoader {
    const isServer = isPlatformServer(platformId);

    const baseUrl = isServer
        ? 'https://www.mhtorremolinos.com/assets/i18n/'
        : '/assets/i18n/';

    return new TranslateHttpLoader(http, baseUrl, '.json');
}
