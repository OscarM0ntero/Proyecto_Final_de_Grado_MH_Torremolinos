// Dialog mostrado al volver de Stripe con el pago completado
import { Component } from '@angular/core';
import { MaterialModule } from '../../../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-pago-completado',
	template: `
      <div style="padding: 30px 30px 10px 30px; text-align: center;">
      <div style="font-size: 42px; color: var(--color-primary);">✓</div>
      <h2>{{ 'BOOKING.PAYMENT-OK-TITLE' | translate }}</h2>
      <p style="margin: 0">{{ 'BOOKING.PAYMENT-OK-TEXT' | translate }}</p>
      <mat-dialog-actions align="center">
      <button mat-button mat-dialog-close>{{ 'BOOKING.CLOSE' | translate }}</button>
      </mat-dialog-actions>
      </div>
  `,
	imports: [MaterialModule, TranslateModule]
})
export class PagoCompletadoComponent { }
