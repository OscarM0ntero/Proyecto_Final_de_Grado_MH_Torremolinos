// Diálogo de confirmación antes de cancelar una reserva desde el enlace mágico
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-confirmar-cancelacion',
	template: `
      <div style="padding: 28px 28px 8px 28px; text-align: center; max-width: 420px;">
        <h2 style="margin-top: 0;">{{ 'MANAGE.CANCEL-CONFIRM-TITLE' | translate }}</h2>
        <p style="margin: 0 0 8px;">{{ 'MANAGE.CANCEL-CONFIRM-TEXT' | translate: { amount: data.importe } }}</p>
        <mat-dialog-actions align="center">
          <button mat-stroked-button [mat-dialog-close]="false">{{ 'MANAGE.CANCEL-NO' | translate }}</button>
          <button mat-raised-button color="warn" [mat-dialog-close]="true">{{ 'MANAGE.CANCEL-YES' | translate }}</button>
        </mat-dialog-actions>
      </div>
  `,
	imports: [MaterialModule, TranslateModule, CommonModule]
})
export class ConfirmarCancelacionComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: { importe: number }) { }
}
