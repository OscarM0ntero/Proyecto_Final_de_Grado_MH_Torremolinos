import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { isPlatformServer } from '@angular/common';

export function createTranslateLoader(http: HttpClient, platformId: Object): TranslateLoader {
    const isServer = isPlatformServer(platformId);

    const baseUrl = isServer
        ? 'https://www.mhtorremolinos.com/assets/i18n/'  // ❗️Asegúrate que es tu dominio real en producción
        : '/assets/i18n/';

    return new TranslateHttpLoader(http, baseUrl, '.json');
}
