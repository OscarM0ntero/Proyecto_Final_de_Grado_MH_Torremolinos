import { Component } from '@angular/core';
import { UsuariosService } from '../../../../services/usuarios.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-recover-password',
	standalone: false,
	templateUrl: './recover-password.component.html',
	styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent {
	email: string = '';

	constructor(
		private usuariosService: UsuariosService,
		private snackBar: MatSnackBar,
		private router: Router,
		private translate: TranslateService
	) { }

	recuperar() {
		if (!this.email || !this.email.includes('@')) {
			this.snackBar.open(this.translate.instant('SNACKBAR.VALID-EMAIL'), undefined, {
				duration: 3000,
				panelClass: ['snackbar-error']
			});
			return;
		}

		this.usuariosService.recoverPassword(this.email).subscribe({
			next: () => {
				this.snackBar.open(this.translate.instant('SNACKBAR.IF-VALID-EMAIL'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-success']
				});
				this.email = '';
			},
			error: () => {
				this.snackBar.open(this.translate.instant('SNACKBAR.VALID-EMAIL-ERROR'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-error']
				});
			}
		});
	}

	irALogin() {
		this.router.navigate(['/iniciar-sesion']);
	}
}
