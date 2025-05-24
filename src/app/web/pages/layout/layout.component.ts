import { Component, PLATFORM_ID, Inject, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { LoaderService } from '../../../services/loader.service';
import { RecaptchaComponent } from 'ng-recaptcha-2';
import { environment } from '../../../../environments/environment';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-layout',
	standalone: false,
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class LayoutComponent implements OnInit {
	@ViewChild('captchaRef') captchaRef!: RecaptchaComponent;
	tokenCaptcha: string = '';
	siteKey = environment.recaptchaSiteKey;
	captchaResuelto$ = new Subject<string>();

	currentYear = new Date().getFullYear();
	mobileMenuOpen = false;
	selectedLang = 'es';
	cargando = true;

	idiomas = [
		{ codigo: 'es', nombre: 'Español', bandera: 'assets/flags/spain.png' },
		{ codigo: 'en', nombre: 'English', bandera: 'assets/flags/greatBritain.png' },
		{ codigo: 'de', nombre: 'Deutsch', bandera: 'assets/flags/germany.png' },
		{ codigo: 'no', nombre: 'Norsk', bandera: 'assets/flags/norway.png' }
	];

	constructor(
		private router: Router,
		private translate: TranslateService,
		private authService: AuthService,
		private loader: LoaderService,
		@Inject(PLATFORM_ID) private platformId: any
	) {
		if (isPlatformBrowser(this.platformId)) {
			// 🔁 Suscribirse al estado global del loader
			this.loader.cargando$.subscribe(valor => this.cargando = valor);

			// Navegación: mostrar loader brevemente
			this.router.events.subscribe(event => {
				if (event instanceof NavigationStart) {
					this.loader.mostrar();
				}
				if (
					event instanceof NavigationEnd ||
					event instanceof NavigationCancel ||
					event instanceof NavigationError
				) {
					setTimeout(() => this.loader.ocultar(), 100);
				}
			});
		} else {
			this.cargando = true;
		}
	}

	ngOnInit(): void {
		if (isPlatformBrowser(this.platformId)) {
			const lang = localStorage.getItem('lang') || 'es';
			this.translate.use(lang).subscribe(() => {
				document.body.classList.remove('hide-until-translate-loaded');
			});
			this.selectedLang = lang;
		}
	}


	cambiarIdioma(lang: string): void {
		this.selectedLang = lang;
		localStorage.setItem('lang', lang);
		this.translate.use(lang);
	}

	toggleMobileMenu() {
		this.mobileMenuOpen = !this.mobileMenuOpen;
	}

	closeMobileMenu() {
		this.mobileMenuOpen = false;
	}

	//Recaptcha
	verificarCaptcha(): void {
		this.captchaRef?.execute();
	}

	onCaptchaResuelto(token: string | null): void {
		if (!token) return;
		this.tokenCaptcha = token;
		this.captchaResuelto$.next(token);
	}

	resetCaptcha(): void {
		try {
			this.captchaRef?.reset();
		} catch (e) {
			console.warn('No se pudo reiniciar reCAPTCHA:', e);
		}
	}

	get banderaActual(): string {
		const lang = this.idiomas.find(i => i.codigo === this.selectedLang);
		return lang ? lang.bandera : '';
	}

	get botonLoginLabel(): string {
		const rol = this.authService.getRol();
		this.authService.isLoggedIn();
		if (rol === 'administrador') return 'NAVBAR.ADMIN';
		if (rol === 'cliente') return 'NAVBAR.CLIENT';
		return 'NAVBAR.LOGIN';
	}

}
