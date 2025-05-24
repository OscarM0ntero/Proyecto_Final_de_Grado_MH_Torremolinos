import { Injectable, inject } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private platformId = inject(PLATFORM_ID);

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Solo añadir token en entorno navegador
        if (!isPlatformBrowser(this.platformId)) return next.handle(req);

        const token = localStorage.getItem('token');

        // Solo inyectar si hay token y va a /api/
        if (token && req.url.startsWith('/api/')) {
            const cloned = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return next.handle(cloned);
        }

        return next.handle(req);
    }
}
