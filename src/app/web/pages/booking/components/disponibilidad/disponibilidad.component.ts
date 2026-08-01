import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { DisponibilidadService } from '../../../../../services/disponibilidad.service';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { LoaderService } from '../../../../../services/loader.service';
import { ReservaConfirmadaComponent } from './dialogs/reserva-confirmada.component';
import { ReservaRequiereLoginComponent } from './dialogs/reserva-requiere-login.component';
import { environment } from '../../../../../../environments/environment';
import { LayoutComponent } from '../../../layout/layout.component';
import { PREFIJOS_TELEFONO } from '../../../../../shared/prefijos';
import { ReservasService } from '../../../../../services/reservas.service';
import { UsuariosService } from '../../../../../services/usuarios.service';
import { ConfiguracionService } from '../../../../../services/configuracion.service';

@Component({
	selector: 'app-disponibilidad',
	standalone: false,
	templateUrl: './disponibilidad.component.html',
	styleUrls: ['./disponibilidad.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class DisponibilidadComponent implements OnInit {
	tokenCaptcha: string = '';
	siteKey = environment.recaptchaSiteKey;

	disponibilidad: { fecha: string; precio: number; estado: string; cancelable: number }[] = [];

	fechaInicio: Date | null = null;
	fechaFin: Date | null = null;
	precioMascota = 0;
	precioHabitacion = 0;
	precioBase = 0;
	precioTotal = 0;
	numeroNoches = 0;
	mostrarResumen = false;
	camposBloqueados = false;

	tipoTarifa: 'cancelable' | 'no_cancelable' = 'no_cancelable';
	descuentoNoCancelable = 10;
	descuentoEuros = 0;
	diasCancelacion = 30;
	precioMascotaNoche = 10;
	minNoches = 1;

	get precioConDescuento(): number {
		const habitacionDescontada = Math.round((this.precioHabitacion * (1 - this.descuentoNoCancelable / 100)) * 100) / 100;
		return Math.round((habitacionDescontada + this.precioMascota) * 100) / 100;
	}

	// True cuando las noches del rango tienen precios distintos: el precio/noche mostrado es una media (~)
	get preciosVariables(): boolean {
		if (!this.dias || this.dias.length < 2) return false;
		return this.dias.some((d: any) => d.precio !== this.dias[0].precio);
	}

	get todosLosDiasCancelables(): boolean {
		if (!this.fechaInicio || !this.fechaFin) return true;
		const inicio = this.formatearFechaLocal(this.fechaInicio);
		const fin = this.formatearFechaLocal(this.fechaFin);
		const diasRango = this.disponibilidad.filter(d => d.fecha >= inicio && d.fecha < fin);
		return diasRango.every(d => d.cancelable !== 0);
	}

	reserva: any = {
		nombre: '',
		apellidos: '',
		email: '',
		prefijo: '+34',
		telefono: '',
		huespedes: 4,
		conBebe: false,
		conMascota: false,
		nota: ''
	};

	prefijos = PREFIJOS_TELEFONO;

	dias: any = [];
	precioPorNoche = 0;

	pluralMap = {
		'=1': 'BOOKING.GUEST',
		'other': 'BOOKING.GUESTS'
	};

	nochesPluralMap = {
		'=1': 'BOOKING.NIGHT',
		'other': 'BOOKING.NIGHTS-LC'
	};

	constructor(
		private disponibilidadService: DisponibilidadService,
		private reservasService: ReservasService,
		private usuariosService: UsuariosService,
		private configuracionService: ConfiguracionService,
		private dialog: MatDialog,
		private loader: LoaderService,
		public layout: LayoutComponent,
		@Inject(PLATFORM_ID) private platformId: Object
	) { }

	ngOnInit(): void {
		this.disponibilidadService.getDisponibilidad().subscribe(data => {
			this.disponibilidad = data.map(d => ({
				...d,
				fecha: d.fecha.trim(),
				precio: Number(d.precio),
				cancelable: d.cancelable ?? 1
			}));
		});

		this.configuracionService.getValor('descuento_no_cancelable').subscribe({
			next: (cfg) => { this.descuentoNoCancelable = parseFloat(cfg.valor) || 10; },
			error: () => { this.descuentoNoCancelable = 10; }
		});

		this.configuracionService.getValor('dias_cancelacion').subscribe({
			next: (cfg) => { this.diasCancelacion = parseInt(cfg.valor) || 30; },
			error: () => { this.diasCancelacion = 30; }
		});
		this.configuracionService.getValor('precio_mascota').subscribe({
			next: (cfg) => { this.precioMascotaNoche = parseFloat(cfg.valor) || 10; },
			error: () => { this.precioMascotaNoche = 10; }
		});
		this.configuracionService.getValor('min_noches').subscribe({
			next: (cfg) => { this.minNoches = parseInt(cfg.valor) || 1; },
			error: () => { this.minNoches = 1; }
		});

		const token = isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
		if (token) {
			this.usuariosService.getUsuarioActual().subscribe({
				next: (usuario) => {
					this.reserva.nombre = usuario.nombre;
					this.reserva.apellidos = usuario.apellidos;
					this.reserva.email = usuario.email;
					this.reserva.prefijo = usuario.prefijo;
					this.reserva.telefono = usuario.telefono;
					this.camposBloqueados = true;
				},
				error: () => {
					if (isPlatformBrowser(this.platformId)) localStorage.removeItem('token');
					this.camposBloqueados = false;
				}
			});
		}

		this.layout.captchaResuelto$.subscribe(token => {
			this.tokenCaptcha = token;
			this.enviarReserva();
		});
	}

	verificarCaptcha(): void {
		this.layout.captchaRef?.execute();
	}

	resetCaptcha(): void {
		try {
			this.layout.captchaRef?.reset();
		} catch (e) {
			console.warn('No se pudo reiniciar reCAPTCHA:', e);
		}
	}

	onRangoModelChanged(): void {
		if (this.fechaInicio && this.fechaFin) this.onRangoChange();
	}

	onRangoChange(): void {
		if (!this.fechaInicio || !this.fechaFin) {
			this.precioHabitacion = 0;
			this.precioBase = 0;
			this.precioTotal = 0;
			this.descuentoEuros = 0;
			return;
		}

		const inicio = this.formatearFechaLocal(this.fechaInicio);
		const fin = this.formatearFechaLocal(this.fechaFin);
		const diasEsperados = Math.ceil((new Date(fin).getTime() - new Date(inicio).getTime()) / (1000 * 60 * 60 * 24));
		const fechas = this.disponibilidad.filter(d => d.estado === 'disponible' && d.fecha >= inicio && d.fecha < fin);

		this.numeroNoches = diasEsperados;
		this.dias = fechas;

		this.precioHabitacion = (fechas.length === diasEsperados && diasEsperados >= this.minNoches)
			? fechas.reduce((total, d) => total + d.precio, 0)
			: 0;

		this.calcPrecioMascotas();
		this.precioBase = this.precioHabitacion + this.precioMascota;

		if (!this.todosLosDiasCancelables) {
			this.tipoTarifa = 'no_cancelable';
		}

		this.aplicarDescuento();
		this.precioPorNoche = this.numeroNoches > 0 ? this.precioHabitacion / this.numeroNoches : 0;
	}

	onTarifaChange(): void {
		this.aplicarDescuento();
	}

	aplicarDescuento(): void {
		if (this.tipoTarifa === 'no_cancelable' && this.todosLosDiasCancelables && this.precioHabitacion > 0) {
			this.descuentoEuros = Math.round(this.precioHabitacion * (this.descuentoNoCancelable / 100) * 100) / 100;
			this.precioTotal = Math.round((this.precioHabitacion - this.descuentoEuros + this.precioMascota) * 100) / 100;
		} else {
			this.descuentoEuros = 0;
			this.precioTotal = this.precioBase;
		}
	}

	formatearFechaLocal(fecha: Date): string {
		const y = fecha.getFullYear();
		const m = (fecha.getMonth() + 1).toString().padStart(2, '0');
		const d = fecha.getDate().toString().padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	calcPrecioMascotas(): void {
		this.precioMascota = this.reserva.conMascota ? this.numeroNoches * this.precioMascotaNoche : 0;
	}

	enviarReserva(): void {
		if (!this.fechaInicio || !this.fechaFin || !this.layout.tokenCaptcha) return;

		const payload = {
			...this.reserva,
			fechaInicio: this.formatearFechaLocal(this.fechaInicio),
			fechaFin: this.formatearFechaLocal(this.fechaFin),
			numeroNoches: this.numeroNoches,
			precio_total: this.precioTotal,
			tipo_tarifa: this.tipoTarifa,
			descuento_aplicado: (this.tipoTarifa === 'no_cancelable' && this.todosLosDiasCancelables) ? this.descuentoNoCancelable : 0,
			recaptcha: this.layout.tokenCaptcha
		};

		this.loader.mostrar();

		this.reservasService.enviarReserva(payload).subscribe({
			next: () => {
				this.dialog.open(ReservaConfirmadaComponent);
				this.mostrarResumen = false;
				this.layout.tokenCaptcha = '';
				this.loader.ocultar();
				this.layout.resetCaptcha();
			},
			error: err => {
				this.loader.ocultar();
				this.layout.resetCaptcha();

				if (err.status === 409 && err.error?.requiereLogin) {
					this.dialog.open(ReservaRequiereLoginComponent);
				} else {
					alert('Error al enviar la reserva');
				}
			}
		});
	}

	dateClass: MatCalendarCellClassFunction<Date> = (date: Date) => {
		const fechaStr = this.formatearFechaLocal(date);
		const dia = this.disponibilidad.find(d => d.fecha === fechaStr);
		return dia?.estado ? `dia-${dia.estado}` : '';
	};

	private esDisponible(fecha: Date): boolean {
		const fechaStr = this.formatearFechaLocal(fecha);
		const dia = this.disponibilidad.find(d => d.fecha === fechaStr);
		return dia?.estado === 'disponible';
	}

	get nochesSeleccionadas(): number {
		if (!this.fechaInicio || !this.fechaFin) return 0;
		return Math.round((this.fechaFin.getTime() - this.fechaInicio.getTime()) / 86400000);
	}

	// Un día es check-in válido si las min_noches noches siguientes están disponibles
	private esCheckInValido(date: Date): boolean {
		const cursor = new Date(date);
		for (let i = 0; i < this.minNoches; i++) {
			if (!this.esDisponible(cursor)) return false;
			cursor.setDate(cursor.getDate() + 1);
		}
		return true;
	}

	dateFilter = (date: Date | null): boolean => {
		if (!date) return false;

		// Seleccionando check-out: exigir estancia mínima y todas las noches intermedias disponibles.
		// Las fechas anteriores al inicio reinician el rango, así que se validan como check-in.
		if (this.fechaInicio && !this.fechaFin) {
			if (date <= this.fechaInicio) return this.esCheckInValido(date);

			const noches = Math.round((date.getTime() - this.fechaInicio.getTime()) / 86400000);
			if (noches < this.minNoches) return false;

			const cursor = new Date(this.fechaInicio);
			while (cursor < date) {
				if (!this.esDisponible(cursor)) return false;
				cursor.setDate(cursor.getDate() + 1);
			}
			return true;
		}

		// Seleccionando check-in
		return this.esCheckInValido(date);
	};
}
