import { Component } from '@angular/core';
import { UsuariosService } from '../../../../services/usuarios.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
		private router: Router
	) { }

	recuperar() {
		if (!this.email || !this.email.includes('@')) {
			this.snackBar.open('Introduce un correo válido', 'Cerrar', {
				duration: 4000,
				panelClass: ['snackbar-error']
			});
			return;
		}

		this.usuariosService.recoverPassword(this.email).subscribe({
			next: () => {
				this.snackBar.open('Si el correo está registrado, se enviará una nueva contraseña', 'Cerrar', {
					duration: 4000,
					panelClass: ['snackbar-success']
				});
				this.email = '';
			},
			error: () => {
				this.snackBar.open('Error al intentar recuperar la contraseña', 'Cerrar', {
					duration: 4000,
					panelClass: ['snackbar-error']
				});
			}
		});
	}

	irALogin() {
		this.router.navigate(['/iniciar-sesion']);
	}
}
