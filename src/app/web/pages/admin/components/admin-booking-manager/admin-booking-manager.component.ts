import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Reserva, ReservasService } from '../../../../../services/reservas.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmStateDialogComponent } from './dialogs/confirm-state-dialog.component';
import { EditBookingDialogComponent } from './dialogs/edit-booking-dialog.component';
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

	// Vista por defecto: lo que el administrador necesita ver a diario.
	// Oculta canceladas, rechazadas y pendientes (con Stripe, "Pendiente" ya no es
	// "esperando aprobación" sino un pago que el cliente no llegó a terminar).
	soloRelevantes = true;

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
			this.reservas = this.ordenar(res);
			this.aplicarFiltroTexto();
		});
	}

	// Grupo por el que se ordena la lista: primero lo que está por llegar.
	//   1 próximas confirmadas · 2 estancias pasadas · 3 pagos sin terminar · 4 canceladas/rechazadas
	private grupo(r: Reserva): number {
		const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
		const terminada = new Date(r.fecha_fin) < hoy;

		if (r.estado_reserva === 'Cancelada' || r.estado_reserva === 'Rechazada') return 4;
		if (r.estado_reserva === 'Pendiente') return 3;
		if (r.estado_reserva === 'Confirmada' && !terminada) return 1;
		return 2;
	}

	private ordenar(lista: Reserva[]): Reserva[] {
		return [...lista].sort((a, b) => {
			const ga = this.grupo(a), gb = this.grupo(b);
			if (ga !== gb) return ga - gb;

			const fa = new Date(a.fecha_inicio).getTime();
			const fb = new Date(b.fecha_inicio).getTime();
			// Las próximas, de más cercana a más lejana; el resto, lo más reciente primero
			return ga === 1 ? fa - fb : fb - fa;
		});
	}

	aplicarFiltroTexto(): void {
		// Con un estado concreto seleccionado se respeta esa elección; si no, se aplica la vista por defecto
		const base = (this.soloRelevantes && !this.estadoFiltro)
			? this.reservas.filter(r => this.grupo(r) <= 2)
			: this.reservas;

		const q = this.textoBusqueda.trim().toLowerCase();
		if (!q) {
			this.reservasFiltradas = [...base];
			return;
		}
		this.reservasFiltradas = base.filter(r => {
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

	// Idioma en que el huésped usó la web (para saber cómo escribirle) y país de la tarjeta
	getIdiomaPais(r: Reserva): string {
		const idiomas: Record<string, string> = { es: 'Español', en: 'English', de: 'Deutsch', no: 'Norsk' };
		const partes = [];
		if (r.cliente_idioma) partes.push(idiomas[r.cliente_idioma] || r.cliente_idioma);
		if (r.cliente_pais) partes.push(r.cliente_pais);
		return partes.join(' · ');
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

	// Gastos retenidos al cancelar. Mismo cálculo que calcularComision() en el servidor:
	// el porcentaje va congelado en la reserva, así que no depende de la configuración actual.
	gastosRetenidos(r: any): number {
		const pct = Number(r?.comision_cancelacion_pct) || 0;
		const base = Number(r?.importe_pagado ?? r?.precio_total) || 0;
		if (pct <= 0 || base <= 0) return 0;
		return Math.round(base * pct) / 100;
	}

	// Junto al estado del pago se muestra lo devuelto cuando está reembolsada, no lo cobrado:
	// si no, se leía "Reembolsado · 940,00 €" habiendo devuelto 921,20 €.
	importeDelPago(r: any): number {
		const pagado = Number(r?.importe_pagado) || 0;
		return r?.estado_pago === 'reembolsado'
			? Math.round((pagado - this.gastosRetenidos(r)) * 100) / 100
			: pagado;
	}

	// Último día en que el huésped puede cancelar, incluido. Mismo cálculo que el servidor
	// en fechaLimiteCancelacion(): fecha de entrada menos los días de margen de la reserva.
	fechaLimiteCancelacion(r: any): Date | null {
		if (!r?.fecha_inicio) return null;
		const d = new Date(r.fecha_inicio);
		const limite = new Date(d.getFullYear(), d.getMonth(), d.getDate());
		limite.setDate(limite.getDate() - (Number(r.dias_cancelacion) || 0));
		return limite;
	}

	plazoCancelacionPasado(r: any): boolean {
		const limite = this.fechaLimiteCancelacion(r);
		if (!limite) return false;
		const ahora = new Date();
		return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()) > limite;
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

	editarReserva(reserva: Reserva): void {
		const ref = this.dialog.open(EditBookingDialogComponent, { data: reserva, maxWidth: '95vw' });

		ref.afterClosed().subscribe(datos => {
			if (!datos) return;
			this.reservasService.actualizarReserva(reserva.id_reserva, datos).subscribe({
				next: () => {
					this.aviso('Reserva actualizada', true);
					this.cargarReservas();
				},
				error: (err) => this.aviso(err?.error?.error || 'No se pudo actualizar la reserva', false)
			});
		});
	}

	reenviarConfirmacion(reserva: Reserva): void {
		this.reservasService.reenviarConfirmacion(reserva.id_reserva).subscribe({
			next: () => this.aviso('Email reenviado al huésped', true),
			error: () => this.aviso('No se pudo reenviar el email', false)
		});
	}

	// Enlace privado del huésped, para pegarlo en un WhatsApp o un email manual
	copiarEnlace(reserva: Reserva): void {
		if (!reserva.token_acceso) {
			this.aviso('Esta reserva no tiene enlace de gestión', false);
			return;
		}
		const url = `${window.location.origin}/reserva/${reserva.token_acceso}`;
		navigator.clipboard.writeText(url).then(
			() => this.aviso('Enlace copiado al portapapeles', true),
			() => this.aviso('No se pudo copiar el enlace', false)
		);
	}

	private aviso(texto: string, ok: boolean): void {
		this.snackBar.open(texto, undefined, {
			duration: 4000,
			panelClass: [ok ? 'snackbar-success' : 'snackbar-error']
		});
	}

	// Solo se ofrecen los cambios de estado que tienen sentido desde el estado actual.
	// Debe coincidir con la tabla TRANSICIONES del backend, que es quien manda.
	accionesEstado(r: Reserva): { estado: string; etiqueta: string; icono: string; peligro: boolean }[] {
		const estanciaTerminada = new Date(r.fecha_fin) < new Date();

		// Pendiente = pago sin terminar. Se limpia solo (sesión de Stripe caducada + job de
		// reconciliación), así que no se ofrece cancelar a mano.
		if (r.estado_reserva === 'Pendiente') {
			return [{ estado: 'Confirmada', etiqueta: 'Confirmar', icono: 'check_circle', peligro: false }];
		}

		if (r.estado_reserva === 'Confirmada') {
			const acciones = [{ estado: 'Cancelada', etiqueta: 'Cancelar', icono: 'cancel', peligro: true }];
			if (estanciaTerminada) {
				acciones.unshift({ estado: 'Finalizada', etiqueta: 'Marcar finalizada', icono: 'task_alt', peligro: false });
			}
			return acciones;
		}

		// Cancelada, Rechazada y Finalizada son estados finales
		return [];
	}

	cambiarEstado(reserva: Reserva, destino: string): void {
		const importe = Number(reserva.importe_pagado || reserva.precio_total).toFixed(2);
		const hayQueReembolsar = reserva.estado_pago === 'pagado'
			&& ['Cancelada', 'Rechazada'].includes(destino);

		const textos: Record<string, { titulo: string; mensaje: string }> = {
			'Confirmada': {
				titulo: '¿Confirmar la reserva?',
				mensaje: 'Se bloquearán esos días en el calendario y se enviará al huésped un email de confirmación.'
			},
			'Finalizada': {
				titulo: '¿Marcar como finalizada?',
				mensaje: 'La estancia pasa al histórico. Los días siguen bloqueados y no se envía ningún email.'
			},
			'Cancelada': {
				titulo: '¿Cancelar la reserva?',
				mensaje: 'Los días volverán a estar disponibles y se avisará al huésped por email.'
			},
			'Rechazada': {
				titulo: '¿Rechazar la reserva?',
				mensaje: 'Los días volverán a estar disponibles y se avisará al huésped por email.'
			}
		};

		const ref = this.dialog.open(ConfirmStateDialogComponent, {
			data: {
				titulo: textos[destino].titulo,
				mensaje: textos[destino].mensaje,
				aviso: hayQueReembolsar
					? `Se devolverán ${importe} € al huésped por Stripe. Esta acción no se puede deshacer.`
					: undefined,
				textoBoton: 'Sí, continuar',
				peligro: destino === 'Cancelada' || destino === 'Rechazada'
			}
		});

		ref.afterClosed().subscribe(confirmado => {
			if (!confirmado) return;
			this.reservasService.actualizarEstadoReserva(reserva.id_reserva, destino).subscribe({
				next: () => {
					this.aviso(hayQueReembolsar ? `Reserva cancelada y ${importe} € reembolsados` : 'Estado actualizado', true);
					this.cargarReservas();
				},
				error: (err) => {
					this.aviso(err?.error?.error || 'No se pudo cambiar el estado', false);
					this.cargarReservas();
				}
			});
		});
	}
}
