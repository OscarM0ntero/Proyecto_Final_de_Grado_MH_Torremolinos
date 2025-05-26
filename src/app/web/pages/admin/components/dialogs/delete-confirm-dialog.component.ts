import { Component } from '@angular/core';
import { MaterialModule } from '../../../../../material/material.module';

@Component({
  selector: 'app-delete-confirm-dialog',
  template: `
    <div style="padding: 30px 30px 10px 30px; text-align: center">
      <h2>¿Eliminar imagen?</h2>
      <p style="margin: 0">¿Estás seguro de que quieres eliminar esta imagen?</p>
      <mat-dialog-actions align="center" style="margin-top: 20px;">
        <button mat-button mat-dialog-close>No</button>
        <button mat-raised-button style="background-color: var(--color-warn) !important" [mat-dialog-close]="true">Sí, eliminar</button>
      </mat-dialog-actions>
    </div>
  `,
  imports: [MaterialModule]

})
export class DeleteConfirmDialogComponent { }
