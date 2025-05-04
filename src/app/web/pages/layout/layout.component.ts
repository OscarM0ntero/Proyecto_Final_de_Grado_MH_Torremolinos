import { Component } from '@angular/core';
import { Router } from '@angular/router';
//import { User } from 'src/app/auth/interfaces/user.interface';
//import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
	selector: 'app-layout',
	standalone: false,
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.scss']
})

export class LayoutComponent {

	currentYear = new Date().getFullYear();

	constructor(
		private router: Router,
		//private authService: AuthService
	) { }

	mobileMenuOpen = false;

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

	get user(): string {
		return "User";
	}



}