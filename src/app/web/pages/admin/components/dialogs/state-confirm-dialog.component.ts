import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../../../material/material.module';

@Component({
  selector: 'app-confirm-state-dialog',
  template: `
    <div style="padding: 30px 30px 10px 30px; text-align: center">
      <h2>¿Cambiar estado?</h2>
      <p style="margin: 0">
        ¿Estás seguro de que quieres cambiar el estado de esta reserva a <strong>{{ data.estado }}</strong>?
      </p>
      <mat-dialog-actions align="center" style="margin-top: 20px;">
        <button mat-raised-button style="background-color: var(--color-warn) !important" mat-dialog-close>No</button>
        <button mat-button [mat-dialog-close]="true">
          Sí, cambiar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  imports: [MaterialModule]
})
export class ConfirmStateDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { estado: string }) { }
}
