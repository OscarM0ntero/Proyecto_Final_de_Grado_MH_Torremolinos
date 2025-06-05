import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Usuario, UsuariosService } from '../../../../../services/usuarios.service';
import { EditUserDialogComponent } from './dialogs/edit-user-dialog/edit-user-dialog.component';
import { DeleteUserConfirmDialogComponent } from './dialogs/delete-user-confirm-dialog.component';
import { AddUserDialogComponent } from './dialogs/add-user-dialog/add-user-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-admin-users-manager',
	standalone: false,
	templateUrl: './admin-users-manager.component.html',
	styleUrl: './admin-users-manager.component.scss'
})
export class AdminUsersManagerComponent implements OnInit {
	usuarios: Usuario[] = [];
	usuariosFiltrados: Usuario[] = [];
	searchTerm: string = '';

	constructor(
		private usuariosService: UsuariosService,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private translate: TranslateService
	) { }

	ngOnInit(): void {
		this.cargarUsuarios();
	}

	cargarUsuarios(): void {
		this.usuariosService.getUsuarios().subscribe({
			next: (data) => {
				this.usuarios = data;
				this.filtrarUsuarios();
			},
			error: () => {
				this.snackBar.open(this.translate.instant('SNACKBAR.LOAD-USERS-ERROR'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-error']
				});
			}
		});
	}

	filtrarUsuarios(): void {
		const term = this.searchTerm.toLowerCase();
		this.usuariosFiltrados = this.usuarios.filter(u =>
			u.nombre.toLowerCase().includes(term) ||
			u.apellidos.toLowerCase().includes(term) ||
			u.email.toLowerCase().includes(term)
		);
	}

	abrirDialogEditar(usuario: Usuario): void {
		const dialogRef = this.dialog.open(EditUserDialogComponent, {
			width: '560px',
			data: { ...usuario }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.usuariosService.actualizarUsuario(usuario.id_usuario, result).subscribe({
					next: () => {
						this.snackBar.open(this.translate.instant('SNACKBAR.USER-UPDATED'), undefined, {
							duration: 3000,
							panelClass: ['snackbar-success']
						});
						this.cargarUsuarios();
					},
					error: () => {
						this.snackBar.open(this.translate.instant('SNACKBAR.USER-UPDATED-ERROR'), undefined, {
							duration: 3000,
							panelClass: ['snackbar-error']
						});
					}
				});
			}
		});
	}

	eliminarUsuario(usuario: Usuario): void {
		const dialogRef = this.dialog.open(DeleteUserConfirmDialogComponent);

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.usuariosService.eliminarUsuario(usuario.id_usuario).subscribe({
					next: () => {
						this.snackBar.open(this.translate.instant('SNACKBAR.USER-DELETED'), undefined, {
							duration: 3000,
							panelClass: ['snackbar-success']
						});
						this.cargarUsuarios();
					},
					error: () => {
						this.snackBar.open(this.translate.instant('SNACKBAR.USER-DELETED-ERROR'), undefined, {
							duration: 3000,
							panelClass: ['snackbar-error']
						});
					}
				});
			}
		});
	}

	abrirDialogAdd(): void {
		const dialogRef = this.dialog.open(AddUserDialogComponent, {
			width: '560px',
			disableClose: true,
		});

		dialogRef.afterClosed().subscribe((nuevoUsuario: Usuario) => {
			if (nuevoUsuario) {
				this.usuariosService.crearUsuario(nuevoUsuario).subscribe({
					next: () => {
						this.snackBar.open(this.translate.instant('SNACKBAR.USER-CREATED'), undefined, {
							duration: 3000,
							panelClass: ['snackbar-success']
						});
						this.cargarUsuarios();
					},
					error: () => {
						this.snackBar.open(this.translate.instant('SNACKBAR.USER-CREATED-ERROR'), undefined, {
							duration: 3000,
							panelClass: ['snackbar-error']
						});
					}
				});
			}
		});
	}
}
