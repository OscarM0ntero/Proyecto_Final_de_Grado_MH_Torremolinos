// Dialog mostrado al volver de Stripe con el pago completado.
// El enlace a la reserva solo aparece si el token sigue en sessionStorage (la misma pestaña que
// hizo el pago). Si no está, el correo de confirmación lleva igualmente ese mismo enlace.
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-pago-completado',
	template: `
      <div class="pc-dialogo">
        <div class="pc-tic">✓</div>
        <h2 class="pc-titulo">{{ 'BOOKING.PAYMENT-OK-TITLE' | translate }}</h2>
        <p class="pc-texto">{{ 'BOOKING.PAYMENT-OK-TEXT' | translate }}</p>
        <mat-dialog-actions class="pc-acciones">
          <a *ngIf="data?.token" mat-raised-button class="pc-principal"
             [routerLink]="['/reserva', data.token]" mat-dialog-close>
            {{ 'BOOKING.VIEW-BOOKING' | translate }}
          </a>
          <button mat-stroked-button mat-dialog-close>{{ 'BOOKING.CLOSE' | translate }}</button>
        </mat-dialog-actions>
      </div>
  `,
	styles: [`
    /* El ancho lo fija dialog.open({ width }): desde aquí no se puede, porque el host del
       componente no tiene ancho propio. Con el ancho natural los dos botones sumaban más
       que el contenedor y caían a dos líneas, y en alemán el texto es aún más largo. */
    :host {
      display: block;
    }

    .pc-dialogo {
      padding: 30px 26px 14px;
      text-align: center;
      box-sizing: border-box;
    }

    .pc-tic {
      font-size: 42px;
      line-height: 1;
      color: var(--color-primary);
    }

    .pc-titulo {
      margin: 10px 0 8px;
      font-size: 21px;
      color: var(--color-primary);
    }

    .pc-texto {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: #555;
    }

    .pc-acciones {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 22px 0 0;
    }

    .pc-acciones button,
    .pc-acciones a {
      margin: 0;
      min-width: 130px;
    }

    .pc-principal {
      background: var(--color-primary);
      color: #fff;
    }

    @media (max-width: 480px) {
      .pc-dialogo { padding: 26px 18px 12px; }
      .pc-acciones { flex-direction: column; gap: 10px; }
      .pc-acciones button,
      .pc-acciones a { width: 100%; }
    }
  `],
	imports: [MaterialModule, TranslateModule, RouterModule, CommonModule]
})
export class PagoCompletadoComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: { token: string | null }) { }
}
