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
