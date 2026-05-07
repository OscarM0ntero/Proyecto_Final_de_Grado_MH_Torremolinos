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

	tipoTarifa: 'cancelable' | 'no_cancelable' = 'cancelable';
	descuentoNoCancelable = 10;
	descuentoEuros = 0;
	diasCancelacion = 30;

	get precioConDescuento(): number {
		const habitacionDescontada = Math.round((this.precioHabitacion * (1 - this.descuentoNoCancelable / 100)) * 100) / 100;
		return Math.round((habitacionDescontada + this.precioMascota) * 100) / 100;
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

		this.precioHabitacion = fechas.length === diasEsperados
			? fechas.reduce((total, d) => total + d.precio, 0)
			: 0;

		this.calcPrecioMascotas();
		this.precioBase = this.precioHabitacion + this.precioMascota;

		if (!this.todosLosDiasCancelables) {
			this.tipoTarifa = 'no_cancelable';
		}

		this.aplicarDescuento();
		this.precioPorNoche = this.precioBase / this.numeroNoches;
	}

	onTarifaChange(): void {
		this.aplicarDescuento();
	}

	aplicarDescuento(): void {
		if (this.tipoTarifa === 'no_cancelable' && this.precioHabitacion > 0) {
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
		this.precioMascota = this.reserva.conMascota ? this.numeroNoches * 10 : 0;
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
			descuento_aplicado: this.tipoTarifa === 'no_cancelable' ? this.descuentoNoCancelable : 0,
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

	dateFilter = (date: Date | null): boolean => {
		if (!date) return false;
		const fechaStr = this.formatearFechaLocal(date);
		const dia = this.disponibilidad.find(d => d.fecha === fechaStr);
		if (dia?.estado === 'disponible') return true;

		const anterior = new Date(date);
		anterior.setDate(anterior.getDate() - 1);
		const anteriorStr = this.formatearFechaLocal(anterior);
		const diaAntes = this.disponibilidad.find(d => d.fecha === anteriorStr);

		return diaAntes?.estado === 'disponible';
	};
}
