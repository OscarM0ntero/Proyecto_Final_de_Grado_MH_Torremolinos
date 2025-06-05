import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-login-menu',
	standalone: false,
	templateUrl: './login-menu.component.html',
	styleUrl: './login-menu.component.scss'
})
export class LoginMenuComponent {
	email = '';
	contrasena = '';
	error = '';

	constructor(
		private http: HttpClient,
		private router: Router,
		private auth: AuthService,
		private snackBar: MatSnackBar,
		private translate: TranslateService
	) { }

	// Envia los datos al endpoint para hacer post en la BD
	login(): void {
		this.http.post<{ token: string }>('/api/login', {
			email: this.email,
			contrasena: this.contrasena
		}).subscribe({
			next: res => {
				localStorage.setItem('token', res.token);

				const rol = this.auth.getRol();
				if (rol === "administrador") {
					this.router.navigate(['/admin']);
				} else {
					this.router.navigate(['/cliente']);
				}
			},
			error: () => {
				this.snackBar.open(this.translate.instant('SNACKBAR.LOGIN-DATA-ERROR'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-error']
				});
			}

		});
	}
}
