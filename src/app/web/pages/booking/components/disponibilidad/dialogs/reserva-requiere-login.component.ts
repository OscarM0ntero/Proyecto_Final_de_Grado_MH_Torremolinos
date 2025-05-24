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


/*

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-reserva-requiere-login',
    standalone: false,
    template: `
    <h2>Inicio de sesión requerido</h2>
    <p>El correo introducido ya está registrado. Por favor, inicia sesión para continuar.</p>
    <button mat-button (click)="goToLogin()">Ir a iniciar sesión</button>
    <button mat-button mat-dialog-close>Cancelar</button>
  `
})
export class ReservaRequiereLoginComponent {
    constructor(
        private router: Router,
        private dialogRef: MatDialogRef<ReservaRequiereLoginComponent>
    ) { }

    goToLogin(): void {
        this.dialogRef.close();
        this.router.navigate(['/iniciar-sesion']);
    }
}
*/