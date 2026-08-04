import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { DisponibilidadService } from '../../../../../services/disponibilidad.service';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { LoaderService } from '../../../../../services/loader.service';
import { PagoCompletadoComponent } from './dialogs/pago-completado.component';
import { environment } from '../../../../../../environments/environment';
import { LayoutComponent } from '../../../layout/layout.component';
import { PREFIJOS_TELEFONO } from '../../../../../shared/prefijos';
import { ReservasService } from '../../../../../services/reservas.service';
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

	tipoTarifa: 'cancelable' | 'no_cancelable' = 'no_cancelable';
	descuentoNoCancelable = 10;
	descuentoEuros = 0;
	diasCancelacion = 30;
	precioMascotaNoche = 10;
	minNoches = 1;
	comisionPct = 0;
	horaCheckin = '16:00';
	horaCheckout = '11:00';

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

	// Reservar con menos margen que la ventana de cancelación deja esa ventana cerrada desde el
	// primer momento. En ese caso la tarifa flexible no se ofrece: sería cobrar más por un derecho
	// que no llega a existir. El servidor aplica esta misma regla al crear la reserva.
	get ventanaCancelacionAbierta(): boolean {
		const limite = this.fechaLimiteCancelacionDe(this.fechaInicio);
		if (!limite) return true;
		const ahora = new Date();
		return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()) <= limite;
	}

	get ofreceTarifaCancelable(): boolean {
		return this.todosLosDiasCancelables && this.ventanaCancelacionAbierta;
	}

	// El descuento de la tarifa no cancelable solo tiene sentido si el rango podría haberse
	// reservado como cancelable: si algún día no lo admite, no se renuncia a nada y no se
	// descuenta. Lo consultan tanto el cálculo del precio como las tarjetas, para que la
	// tarjeta no pueda enseñar un precio distinto del que se cobra.
	get hayDescuentoNoCancelable(): boolean {
		return this.tipoTarifa === 'no_cancelable' && this.todosLosDiasCancelables && this.precioHabitacion > 0;
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
		private configuracionService: ConfiguracionService,
		private dialog: MatDialog,
		private loader: LoaderService,
		public layout: LayoutComponent,
		private route: ActivatedRoute,
		private router: Router,
		private snackBar: MatSnackBar,
		private translate: TranslateService,
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
		this.configuracionService.getValor('comision_cancelacion').subscribe({
			next: (cfg) => { this.comisionPct = parseFloat(cfg.valor) || 0; },
			error: () => { this.comisionPct = 0; }
		});
		this.configuracionService.getValor('hora_checkin').subscribe({
			next: (cfg) => { this.horaCheckin = cfg.valor || '16:00'; },
			error: () => { this.horaCheckin = '16:00'; }
		});
		this.configuracionService.getValor('hora_checkout').subscribe({
			next: (cfg) => { this.horaCheckout = cfg.valor || '11:00'; },
			error: () => { this.horaCheckout = '11:00'; }
		});

		this.layout.captchaResuelto$.subscribe(token => {
			this.tokenCaptcha = token;
			this.enviarReserva();
		});

		// Vuelta desde Stripe Checkout (?pago=ok | ?pago=cancelado)
		this.route.queryParams.subscribe(params => {
			const pago = params['pago'];
			if (!pago || !isPlatformBrowser(this.platformId)) return;

			if (pago === 'ok') {
				this.dialog.open(PagoCompletadoComponent);
			} else if (pago === 'cancelado') {
				this.snackBar.open(
					this.translate.instant('BOOKING.PAYMENT-CANCELLED'),
					undefined,
					{ duration: 5000, panelClass: ['snackbar-error'] }
				);
			}
			// Limpiar el parámetro de la URL
			this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
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

		if (!this.ofreceTarifaCancelable) {
			this.tipoTarifa = 'no_cancelable';
		}

		this.aplicarDescuento();
		this.precioPorNoche = this.numeroNoches > 0 ? this.precioHabitacion / this.numeroNoches : 0;
	}

	onTarifaChange(): void {
		this.aplicarDescuento();
	}

	aplicarDescuento(): void {
		if (this.hayDescuentoNoCancelable) {
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
			idioma: this.translate.currentLang || 'en',
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
			next: (res) => {
				// El backend devuelve la URL de Stripe Checkout: se redirige al pago
				if (res?.url && isPlatformBrowser(this.platformId)) {
					window.location.href = res.url;
					return;
				}
				this.loader.ocultar();
				alert('No se pudo iniciar el pago. Inténtalo de nuevo.');
			},
			error: err => {
				this.loader.ocultar();
				this.layout.resetCaptcha();

				alert(err?.error?.error || 'Error al enviar la reserva');
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

	// Último día en que se admitiría la cancelación, incluido. Mismo cálculo que aplica el
	// servidor en fechaLimiteCancelacion(): entrada menos los días de margen.
	get fechaLimiteCancelacion(): Date | null {
		if (this.tipoTarifa !== 'cancelable') return null;
		return this.fechaLimiteCancelacionDe(this.fechaInicio);
	}

	private fechaLimiteCancelacionDe(fechaInicio: Date | null): Date | null {
		if (!fechaInicio) return null;
		const limite = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
		limite.setDate(limite.getDate() - (Number(this.diasCancelacion) || 0));
		return limite;
	}

	// Lo que se retendría si el huésped cancelara esta reserva
	get comisionCancelacion(): number {
		if (this.tipoTarifa !== 'cancelable' || !this.comisionPct) return 0;
		return Math.round(this.precioTotal * this.comisionPct) / 100;
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

	// Un día vale como check-out si la noche anterior está libre: el día de salida no se
	// duerme, así que no necesita estar disponible él mismo.
	private esCheckOutPosible(date: Date): boolean {
		const anterior = new Date(date);
		anterior.setDate(anterior.getDate() - 1);
		return this.esDisponible(anterior);
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

		// Todavía no hay fechas: el calendario usa este mismo filtro para todas las celdas, así que
		// un día debe quedar activo si puede ser check-in O check-out. Si solo se comprobara el
		// check-in, los últimos días de un hueco quedaban grises y no se podía salir en ellos.
		return this.esCheckInValido(date) || this.esCheckOutPosible(date);
	};
}
