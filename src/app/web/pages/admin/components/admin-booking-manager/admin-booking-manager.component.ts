import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Reserva, ReservasService } from '../../../../../services/reservas.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmStateDialogComponent } from '../dialogs/state-confirm-dialog.component';

@Component({
  selector: 'app-admin-booking-manager',
  standalone: false,
  templateUrl: './admin-booking-manager.component.html',
  styleUrl: './admin-booking-manager.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AdminBookingManagerComponent implements OnInit {
  reservas: Reserva[] = [];
  estadoFiltro: string = '';
  estados = ['Pendiente', 'Confirmada', 'Rechazada', 'Cancelada', 'Finalizada'];
  anticipo: number = 0;

  constructor(
    private reservasService: ReservasService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarReservas();
  }

  calcularAnticipo(precio_total: number): number {
    return precio_total * 0.3;
  }

  cargarReservas(): void {
    if (this.estadoFiltro) {
      this.reservasService.getReservasPorEstado(this.estadoFiltro).subscribe(res => {
        this.reservas = res;
      });
    } else {
      this.reservasService.getTodasReservas().subscribe(res => {
        this.reservas = res;
      });
    }
  }

  confirmarCambioEstado(reserva: Reserva): void {
    const confirmacion = this.dialog.open(ConfirmStateDialogComponent, {
      data: { estado: reserva.estado_reserva }
    });

    confirmacion.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.reservasService.actualizarEstadoReserva(reserva.id_reserva, reserva.estado_reserva).subscribe({
          next: () => {
            this.snackBar.open('Estado actualizado correctamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
            this.cargarReservas();
          },
          error: () => {
            this.snackBar.open('Error al actualizar estado', 'Cerrar', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
      } else {
        this.cargarReservas();
      }
    });
  }
}
