// Dialog indicando que la solicitud de reserva ha sido enviada
import { Component } from '@angular/core';
import { MaterialModule } from '../../../../../../material/material.module';

@Component({
	selector: 'app-reserva-confirmada',
	template: `
      <div style="padding: 30px 30px 10px 30px; text-align: center;">
      <h2>Reserva enviada</h2>
      <p style="margin: 0">Tu solicitud de reserva ha sido enviada. Para finalizar esta reserva deberá <u>realizar una transferencia</u>.<br>Revise su correo para más información.</p>
      <mat-dialog-actions align="center">
      <button mat-button mat-dialog-close>Cerrar</button>
      </mat-dialog-actions>
      </div>
  `,
	imports: [MaterialModule]
})
export class ReservaConfirmadaComponent { }