// Dialog informanfo que el email ya pertenece a una cuenta, y que para reservar debe iniciar sesión
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../../../../material/material.module';

@Component({
    selector: 'app-reserva-requiere-login',
    template: `
        <div style="padding: 30px 30px 10px 30px; text-align: center">
        <h2>Correo ya registrado</h2>
        <p style="margin: 0">Este correo ya está registrado.<br>Inicia sesión para continuar con tu reserva.</p>
        <mat-dialog-actions align="center">
        <button mat-button mat-dialog-close>Cerrar</button>
        <button mat-raised-button mat-dialog-close (click)="irALogin()">Ir a inicio de sesión</button>
        </mat-dialog-actions>
        </div>
    `,
        imports: [MaterialModule]
})
export class ReservaRequiereLoginComponent {
    constructor(private router: Router) { }

    irALogin() {
        this.router.navigate(['/iniciar-sesion']);
    }
}