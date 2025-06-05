import { Component, Inject } from '@angular/core';
import { PREFIJOS_TELEFONO } from '../../../../../../../shared/prefijos';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';
import { Usuario } from '../../../../../../../services/usuarios.service';

@Component({
	selector: 'app-add-user-dialog',
	standalone: false,
	templateUrl: './add-user-dialog.component.html',
	styleUrl: './add-user-dialog.component.scss'
})
export class AddUserDialogComponent {
	prefijos = PREFIJOS_TELEFONO;

	constructor(
		public dialogRef: MatDialogRef<EditUserDialogComponent>,
	) { }

	usuario: Usuario = {
		id_usuario: 0,
		nombre: '',
		apellidos: '',
		email: '',
		prefijo: '+34',
		telefono: '',
		rol: 'cliente'
	}

	guardar(): void {
		this.dialogRef.close(this.usuario);
	}

	cancelar(): void {
		this.dialogRef.close();
	}
}
