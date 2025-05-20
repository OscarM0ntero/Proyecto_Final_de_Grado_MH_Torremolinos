import { Component } from '@angular/core';

@Component({
    selector: 'app-reserva-confirmada',
    standalone: false,
    template: `
    <h2>Solicitud enviada</h2>
    <p>Tu solicitud ha sido enviada correctamente. Te hemos enviado un correo con los detalles.</p>
    <button mat-button mat-dialog-close>Cerrar</button>
  `
})
export class ReservaConfirmadaComponent { }
