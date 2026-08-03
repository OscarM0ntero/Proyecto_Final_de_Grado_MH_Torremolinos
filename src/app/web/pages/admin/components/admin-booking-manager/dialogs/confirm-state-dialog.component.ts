// Confirmación antes de cambiar el estado de una reserva.
// El mensaje explica la consecuencia real (reembolso, días liberados...), porque desde
// aquí se mueve dinero de verdad y antes solo se decía el nombre del estado.
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../../../../material/material.module';

export interface ConfirmStateData {
  titulo: string;
  mensaje: string;
  aviso?: string;      // consecuencia irreversible (reembolso)
  textoBoton: string;
  peligro: boolean;
}

@Component({
  selector: 'app-confirm-state-dialog',
  template: `
    <div style="padding: 28px 28px 8px 28px; max-width: 460px;">
      <h2 style="margin-top: 0;">{{ data.titulo }}</h2>
      <p style="margin: 0 0 12px; color: #555; line-height: 1.5;">{{ data.mensaje }}</p>

      <div *ngIf="data.aviso" class="confirm-aviso">
        <mat-icon>warning</mat-icon>
        <span>{{ data.aviso }}</span>
      </div>

      <mat-dialog-actions align="end" style="margin-top: 16px;">
        <button mat-stroked-button [mat-dialog-close]="false">Cancelar</button>
        <button mat-raised-button [class.btn-peligro]="data.peligro" [mat-dialog-close]="true">
          {{ data.textoBoton }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-aviso {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: #fdf1f1;
      border-left: 4px solid var(--color-warn);
      border-radius: 0 8px 8px 0;
      padding: 12px 14px;
      font-size: 13px;
      line-height: 1.45;
      color: #7a1f1f;
    }
    .confirm-aviso mat-icon { color: var(--color-warn); flex-shrink: 0; }
  `],
  imports: [MaterialModule, CommonModule]
})
export class ConfirmStateDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmStateData) { }
}
