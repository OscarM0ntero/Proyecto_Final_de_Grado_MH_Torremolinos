import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PREFIJOS_TELEFONO } from '../../../../../shared/prefijos';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsuariosService, Usuario } from '../../../../../services/usuarios.service';

@Component({
  selector: 'app-client-account',
  standalone: false,
  templateUrl: './client-account.component.html',
  styleUrls: ['./client-account.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClientAccountComponent implements OnInit {
  datosUsuario: Usuario = {
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

  constructor(
    private usuariosService: UsuariosService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.usuariosService.getUsuarioActual().subscribe({
      next: (res) => this.datosUsuario = res,
      error: () => this.snackBar.open('Error al cargar los datos del usuario', undefined, { duration: 3000 })
    });
  }

  guardarCambios() {
    this.usuariosService.actualizarDatosUsuario(this.datosUsuario).subscribe({
      next: () => this.snackBar.open('Datos actualizados correctamente', undefined, {
        duration: 3000,
        panelClass: ['snackbar-success']
      }),
      error: () => this.snackBar.open('No se pudo guardar los cambios', undefined, {
        duration: 3000,
        panelClass: ['snackbar-error']
      })
    });
  }

  cambiarContrasena() {
    const { actual, nueva, confirmar } = this.passwords;
    this.usuariosService.cambiarPassword(actual, nueva, confirmar).subscribe({
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
