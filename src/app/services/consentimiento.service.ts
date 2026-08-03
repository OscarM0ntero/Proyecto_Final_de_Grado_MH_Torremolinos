// Consentimiento de cookies.
//
// Google Analytics NO se carga hasta que el visitante lo acepta: antes estaba puesto
// directamente en index.html y se ejecutaba siempre, así que un aviso de cookies encima
// habría sido decorativo (el seguimiento ya había ocurrido).
//
// reCAPTCHA se considera necesario: solo protege los formularios de reserva y contacto
// frente a envíos automáticos, no perfila al visitante ni se usa con fines publicitarios.
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type Consentimiento = 'aceptado' | 'rechazado' | null;

const CLAVE = 'consentimiento_cookies';
const ID_ANALYTICS = 'G-9D74D3NF4D';

@Injectable({ providedIn: 'root' })
export class ConsentimientoService {
	/** null mientras el visitante no haya decidido: es cuando se muestra el aviso */
	readonly decision$ = new BehaviorSubject<Consentimiento>(null);

	private analyticsCargado = false;

	constructor(@Inject(PLATFORM_ID) private platformId: Object) {
		if (!isPlatformBrowser(this.platformId)) return;

		const guardado = localStorage.getItem(CLAVE) as Consentimiento;
		if (guardado === 'aceptado' || guardado === 'rechazado') {
			this.decision$.next(guardado);
			if (guardado === 'aceptado') this.cargarAnalytics();
		}
	}

	aceptar(): void {
		this.guardar('aceptado');
		this.cargarAnalytics();
	}

	rechazar(): void {
		this.guardar('rechazado');
		this.borrarCookiesAnalytics();
	}

	/** Permite volver a decidir desde la página legal */
	reabrir(): void {
		if (isPlatformBrowser(this.platformId)) localStorage.removeItem(CLAVE);
		this.decision$.next(null);
	}

	private guardar(valor: Consentimiento): void {
		if (isPlatformBrowser(this.platformId) && valor) localStorage.setItem(CLAVE, valor);
		this.decision$.next(valor);
	}

	// Inyecta gtag.js solo cuando hay consentimiento
	private cargarAnalytics(): void {
		if (!isPlatformBrowser(this.platformId) || this.analyticsCargado) return;
		this.analyticsCargado = true;

		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${ID_ANALYTICS}`;
		document.head.appendChild(script);

		const w = window as any;
		w.dataLayer = w.dataLayer || [];
		w.gtag = function () { w.dataLayer.push(arguments); };
		w.gtag('js', new Date());
		w.gtag('config', ID_ANALYTICS);
	}

	// Si el visitante rechaza después de haber aceptado, se limpian las cookies ya puestas
	private borrarCookiesAnalytics(): void {
		if (!isPlatformBrowser(this.platformId)) return;
		const dominio = location.hostname.replace(/^www\./, '');
		for (const cookie of document.cookie.split(';')) {
			const nombre = cookie.split('=')[0].trim();
			if (!nombre.startsWith('_ga') && !nombre.startsWith('_gid')) continue;
			for (const d of [location.hostname, `.${dominio}`]) {
				document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`;
			}
			document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
		}
	}
}
