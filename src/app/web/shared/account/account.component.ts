import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PREFIJOS_TELEFONO } from '../../../../../shared/prefijos';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuariosService, UsuarioPerfil } from '../../../../../services/usuarios.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-account',
	standalone: false,
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AccountComponent implements OnInit {
	datosUsuario: UsuarioPerfil = {
		nombre: '',
		apellidos: '',
		email: '',
		prefijo: '',
		telefono: ''
	};


	prefijos = PREFIJOS_TELEFONO;

	passwords = {
		actual: '',
		nueva: '',
		confirmar: ''
	};

	constructor(
		private usuariosService: UsuariosService,
		private snackBar: MatSnackBar,
		private translate: TranslateService
	) { }

	ngOnInit(): void {
		this.usuariosService.getUsuarioActual().subscribe({
			next: (res) => this.datosUsuario = res,
			error: () => this.snackBar.open(this.translate.instant('SNACKBAR.LOAD-USER-DATA-ERROR'), undefined, {
				duration: 3000,
				panelClass: ['snackbar-error']
			})
		});
	}

	guardarCambios() {
		this.usuariosService.actualizarDatosUsuario(this.datosUsuario).subscribe({
			next: () => this.snackBar.open(this.translate.instant('SNACKBAR.DATA-UPDATED'), undefined, {
				duration: 3000,
				panelClass: ['snackbar-success']
			}),
			error: () => this.snackBar.open(this.translate.instant('SNACKBAR.DATA-UPDATED-ERROR'), undefined, {
				duration: 3000,
				panelClass: ['snackbar-error']
			})
		});
	}

	cambiarContrasena() {
		const { actual, nueva, confirmar } = this.passwords;
		this.usuariosService.cambiarPassword(actual, nueva, confirmar).subscribe({
			next: () => {
				this.snackBar.open(this.translate.instant('SNACKBAR.PASS-UPDATED'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-success']
				});
				this.passwords = { actual: '', nueva: '', confirmar: '' };
			},
			error: err => {
				this.snackBar.open(this.translate.instant('SNACKBAR.PASS-UPDATED-ERROR'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-error']
				});
			}
		});
	}
}
