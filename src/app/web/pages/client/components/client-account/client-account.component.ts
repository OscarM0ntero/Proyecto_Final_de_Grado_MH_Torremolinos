import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PREFIJOS_TELEFONO } from '../../../../../shared/prefijos';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-client-account',
  standalone: false,
  templateUrl: './client-account.component.html',
  styleUrl: './client-account.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ClientAccountComponent implements OnInit {
  datosUsuario = {
    nombre: '',
    apellidos: '',
    email: '',
    prefijo: '',
    telefono: ''
  };

  prefijos = PREFIJOS_TELEFONO;


  passwords = {
    actual: '',
    nueva: '',
    confirmar: ''
  };


  mensaje = '';
  error = '';

  mensajePass = '';
  errorPass = '';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.http.get('/api/usuarios/me').subscribe({
      next: (res: any) => {
        this.datosUsuario = res;
      },
      error: () => {
        this.error = 'Error al cargar los datos del usuario';
      }
    });
  }

  guardarCambios() {
    this.http.put('/api/usuarios/me', this.datosUsuario).subscribe({
      next: () => {
        this.snackBar.open('Datos actualizados correctamente', undefined, {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      },
      error: () => {
        this.snackBar.open('No se pudo guardar los cambios', undefined, {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  cambiarContrasena() {
    this.http.put('/api/usuarios/me/password', this.passwords).subscribe({
      next: () => {
        this.snackBar.open('Contraseña actualizada correctamente', undefined, {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.passwords = { actual: '', nueva: '', confirmar: '' };
      },
      error: err => {
        this.snackBar.open(err.error?.error || 'Error al actualizar la contraseña', undefined, {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

}