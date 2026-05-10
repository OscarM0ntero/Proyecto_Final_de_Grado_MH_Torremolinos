import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Reserva, ReservasService } from '../../../../../services/reservas.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmStateDialogComponent } from './dialogs/confirm-state-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-admin-booking-manager',
	standalone: false,
	templateUrl: './admin-booking-manager.component.html',
	styleUrl: './admin-booking-manager.component.scss',
	encapsulation: ViewEncapsulation.None
})
export class AdminBookingManagerComponent implements OnInit {
	reservas: Reserva[] = [];
	reservasFiltradas: Reserva[] = [];
	estadoFiltro: string = '';
	textoBusqueda: string = '';
	estados = ['Pendiente', 'Confirmada', 'Rechazada', 'Cancelada', 'Finalizada'];
	anticipoPct: number = 30;

	constructor(
		private reservasService: ReservasService,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private translate: TranslateService
	) { }

	ngOnInit(): void {
		this.cargarReservas();
	}

	cargarReservas(): void {
		const obs = this.estadoFiltro
			? this.reservasService.getReservasPorEstado(this.estadoFiltro)
			: this.reservasService.getTodasReservas();

		obs.subscribe(res => {
			this.reservas = res;
			this.aplicarFiltroTexto();
		});
	}

	aplicarFiltroTexto(): void {
		const q = this.textoBusqueda.trim().toLowerCase();
		if (!q) {
			this.reservasFiltradas = [...this.reservas];
			return;
		}
		this.reservasFiltradas = this.reservas.filter(r => {
			const nombre = this.getNombreCompleto(r).toLowerCase();
			const email = (r.email || r.cliente_email || '').toLowerCase();
			const id = r.id_reserva.toString();
			return nombre.includes(q) || email.includes(q) || id.includes(q);
		});
	}

	getNombreCompleto(r: Reserva): string {
		const nombre = r.nombre || r.cliente_nombre || '';
		const apellidos = r.apellidos || r.cliente_apellidos || '';
		return `${nombre} ${apellidos}`.trim() || 'Cliente eliminado';
	}

	getEmail(r: Reserva): string {
		return r.email || r.cliente_email || '—';
	}

	getTelefono(r: Reserva): string {
		const prefijo = r.prefijo || r.cliente_prefijo || '';
		const tel = r.telefono || r.cliente_telefono || '';
		return tel ? `${prefijo} ${tel}`.trim() : '—';
	}

	calcularNoches(inicio: string, fin: string): number {
		const d1 = new Date(inicio);
		const d2 = new Date(fin);
		return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
	}

	calcularAnticipo(reserva: Reserva): number {
		if (reserva.tipo_tarifa === 'no_cancelable') {
			return reserva.precio_total;
		}
		return reserva.precio_total * (this.anticipoPct / 100);
	}

	getBadgeClass(estado: string): string {
		const map: Record<string, string> = {
			'Pendiente': 'badge-pendiente',
			'Confirmada': 'badge-confirmada',
			'Rechazada': 'badge-rechazada',
			'Cancelada': 'badge-cancelada',
			'Finalizada': 'badge-finalizada'
		};
		return map[estado] || '';
	}

	getCardClass(estado: string): string {
		const map: Record<string, string> = {
			'Pendiente': 'card-pendiente',
			'Confirmada': 'card-confirmada',
			'Rechazada': 'card-rechazada',
			'Cancelada': 'card-cancelada',
			'Finalizada': 'card-finalizada'
		};
		return map[estado] || '';
	}

	confirmarCambioEstado(reserva: Reserva): void {
		const confirmacion = this.dialog.open(ConfirmStateDialogComponent, {
			data: { estado: reserva.estado_reserva }
		});

		confirmacion.afterClosed().subscribe(confirmado => {
			if (confirmado) {
				this.reservasService.actualizarEstadoReserva(reserva.id_reserva, reserva.estado_reserva).subscribe({
					next: () => {
						this.snackBar.open(this.translate.instant('SNACKBAR.STATE-UPDATE-SUCCESS'), undefined, {
							duration: 3000,
							panelClass: ['snackbar-success']
						});
						this.cargarReservas();
					},
					error: () => {
						this.snackBar.open(this.translate.instant('SNACKBAR.STATE-UPDATE-ERROR'), undefined, {
							duration: 3000,
							panelClass: ['snackbar-error']
						});
						this.cargarReservas();
					}
				});
			} else {
				// Revert mat-select to original backend value
				this.cargarReservas();
			}
		});
	}
}
