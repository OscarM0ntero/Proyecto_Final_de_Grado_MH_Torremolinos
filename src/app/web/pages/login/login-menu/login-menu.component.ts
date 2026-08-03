import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutComponent } from '../../layout/layout.component';

@Component({
	selector: 'app-login-menu',
	standalone: false,
	templateUrl: './login-menu.component.html',
	styleUrl: './login-menu.component.scss'
})
export class LoginMenuComponent implements OnInit, OnDestroy {
	email = '';
	contrasena = '';
	error = '';

	// El captcha vive en el layout y avisa por este Subject cuando se resuelve.
	// Hay que soltar la suscripción al salir: el Subject lo comparten reserva y contacto.
	private suscripcionCaptcha?: Subscription;

	constructor(
		private http: HttpClient,
		private router: Router,
		private auth: AuthService,
		private snackBar: MatSnackBar,
		private translate: TranslateService,
		public layout: LayoutComponent
	) { }

	ngOnInit(): void {
		this.suscripcionCaptcha = this.layout.captchaResuelto$.subscribe(() => this.login());
	}

	ngOnDestroy(): void {
		this.suscripcionCaptcha?.unsubscribe();
	}

	// Lanza el captcha; cuando se resuelve se llama a login() con el token
	verificarCaptcha(): void {
		this.layout.captchaRef?.execute();
	}

	// Envia los datos al endpoint para hacer post en la BD
	private login(): void {
		this.http.post<{ token: string }>('/api/login', {
			email: this.email,
			contrasena: this.contrasena,
			recaptcha: this.layout.tokenCaptcha
		}).subscribe({
			next: res => {
				localStorage.setItem('token', res.token);
				this.layout.tokenCaptcha = '';
				this.layout.resetCaptcha();

				// Ya no hay panel de cliente: solo los administradores tienen a dónde ir
				const rol = this.auth.getRol();
				this.router.navigate([rol === 'administrador' ? '/admin' : '/']);
			},
			error: () => {
				this.layout.tokenCaptcha = '';
				this.layout.resetCaptcha();
				this.snackBar.open(this.translate.instant('SNACKBAR.LOGIN-DATA-ERROR'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-error']
				});
			}

		});
	}
}
