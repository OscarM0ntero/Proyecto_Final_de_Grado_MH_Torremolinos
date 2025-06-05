import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Usuario } from '../../../../../../../services/usuarios.service';
import { PREFIJOS_TELEFONO } from '../../../../../../../shared/prefijos';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: false,
  templateUrl: './edit-user-dialog.component.html',
  styleUrl: './edit-user-dialog.component.scss'
})
export class EditUserDialogComponent {
  prefijos = PREFIJOS_TELEFONO;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public usuario: Usuario
  ) { }

  guardar(): void {
    this.dialogRef.close(this.usuario);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}