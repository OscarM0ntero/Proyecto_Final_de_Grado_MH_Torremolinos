// Diálogo de confirmación antes de cancelar una reserva desde el enlace mágico.
// Los importes se presentan como un desglose (pagado → gastos → devolución) en vez de
// sueltos en frases distintas: es el último momento para entender cuánto se recupera.
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-confirmar-cancelacion',
	template: `
      <div class="cc-dialogo">
        <h2 class="cc-titulo">{{ 'MANAGE.CANCEL-CONFIRM-TITLE' | translate }}</h2>

        <div class="cc-desglose">
          <!-- Sin gastos que retener, las tres filas sobran: basta con la devolución -->
          <div class="cc-fila" *ngIf="data.comision > 0">
            <span>{{ 'MANAGE.AMOUNT-PAID' | translate }}</span>
            <span>{{ data.pagado | currency:'EUR':'symbol':'1.2-2':'es-ES' }}</span>
          </div>
          <div class="cc-fila cc-fila--gastos" *ngIf="data.comision > 0">
            <span>{{ 'MANAGE.FEE-LINE' | translate: { pct: data.pct } }}</span>
            <span>−{{ data.comision | currency:'EUR':'symbol':'1.2-2':'es-ES' }}</span>
          </div>
          <div class="cc-fila cc-fila--total">
            <span>{{ 'MANAGE.WILL-REFUND' | translate }}</span>
            <strong>{{ data.importe | currency:'EUR':'symbol':'1.2-2':'es-ES' }}</strong>
          </div>
        </div>

        <p class="cc-nota">
          {{ 'MANAGE.CANCEL-CONFIRM-TEXT' | translate }}
          <strong class="cc-nota-aviso">{{ 'MANAGE.CANCEL-UNDO-WARNING' | translate }}</strong>
        </p>

        <mat-dialog-actions class="cc-acciones">
          <button mat-stroked-button [mat-dialog-close]="false">{{ 'MANAGE.CANCEL-NO' | translate }}</button>
          <button mat-raised-button class="btn-peligro" [mat-dialog-close]="true">{{ 'MANAGE.CANCEL-YES' | translate }}</button>
        </mat-dialog-actions>
      </div>
  `,
	styles: [`
    .cc-dialogo {
      padding: 26px 26px 14px;
      max-width: 420px;
    }

    .cc-titulo {
      margin: 0 0 18px;
      font-size: 21px;
      text-align: center;
      color: var(--color-primary);
    }

    /* Enmarcar el desglose deja claro que las tres cifras son una misma cuenta */
    .cc-desglose {
      background: #faf9f5;
      border: 1px solid #e2ded4;
      border-radius: 8px;
      padding: 12px 14px;
    }

    .cc-fila {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 16px;
      font-size: 14px;
      color: #555;
      padding: 3px 0;
    }

    .cc-fila span:last-child {
      white-space: nowrap;
    }

    .cc-fila--gastos {
      color: #6b4200;
    }

    .cc-fila--total {
      border-top: 1px solid #e2ded4;
      margin-top: 8px;
      padding-top: 10px;
      font-size: 15px;
      color: var(--color-primary);
    }

    .cc-fila--total strong {
      font-size: 18px;
      white-space: nowrap;
    }

    .cc-nota {
      margin: 14px 0 0;
      font-size: 12.5px;
      line-height: 1.5;
      color: #888;
      text-align: center;
    }

    /* Algo más oscuro que el resto de la nota: en negrita sobre gris claro apenas destacaba */
    .cc-nota-aviso {
      color: #555;
      font-weight: 700;
    }

    /* Separados: son acciones opuestas y una de ellas no se deshace */
    .cc-acciones {
      display: flex;
      justify-content: center;
      gap: 14px;
      padding: 20px 0 0;
    }

    /* Material da márgenes distintos al raised y al stroked, y apilados no cuadraban */
    .cc-acciones button {
      min-width: 132px;
      margin: 0;
    }

    @media (max-width: 480px) {
      .cc-dialogo { padding: 22px 18px 12px; }
      .cc-acciones { flex-direction: column-reverse; gap: 10px; }
      .cc-acciones button { width: 100%; }
    }
  `],
	imports: [MaterialModule, TranslateModule, CommonModule]
})
export class ConfirmarCancelacionComponent {
	constructor(@Inject(MAT_DIALOG_DATA) public data: {
		importe: number;   // lo que se devuelve
		pagado: number;    // lo que se cobró
		comision: number;  // gastos de cancelación retenidos
		pct: number;
	}) { }
}
