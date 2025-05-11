import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
//import { User } from 'src/app/auth/interfaces/user.interface';
//import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
	selector: 'app-layout',
	standalone: false,
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class LayoutComponent {

	currentYear = new Date().getFullYear();
	mobileMenuOpen = false;

	idiomas: any[] = [
		{ codigo: 'es', nombre: 'Español', bandera: 'assets/flags/spain.png' },
		{ codigo: 'en', nombre: 'English', bandera: 'assets/flags/greatBritain.png' },
		{ codigo: 'de', nombre: 'Deutsch', bandera: 'assets/flags/germany.png' },
		{ codigo: 'no', nombre: 'Norsk', bandera: 'assets/flags/norway.png' }
	];

	selectedLang = 'es';

	constructor(
		private router: Router,
		private translate: TranslateService
		//private authService: AuthService
	) {
		this.selectedLang = this.translate.currentLang || 'es';
	}

	cambiarIdioma(lang: string): void {
		this.selectedLang = lang;
		this.translate.use(lang);
	}

	toggleMobileMenu() {
		this.mobileMenuOpen = !this.mobileMenuOpen;
	}

	closeMobileMenu() {
		this.mobileMenuOpen = false;
	}

	//onLogout(): void {
	//	this.authService.doLogout();
	//	this.router.navigate(['/auth']);
	//}

	//get user(): string | null {
	//	return localStorage.getItem('nombre_publico');
	//}

	get banderaActual(): string {
		const lang = this.idiomas.find(i => i.codigo === this.selectedLang);
		return lang ? lang.bandera : '';
	}


	get user(): string {
		return "User";
	}



}