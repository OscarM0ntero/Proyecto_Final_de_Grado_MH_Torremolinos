import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarEvent, CalendarMonthViewDay, CalendarView } from 'angular-calendar';
import { DisponibilidadService } from '../../../../../services/disponibilidad.service';
import { startOfDay } from 'date-fns';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-admin-calendar-manager',
	standalone: false,
	templateUrl: './admin-calendar-manager.component.html',
	styleUrls: ['./admin-calendar-manager.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AdminCalendarManagerComponent implements OnInit {
	disponibilidad: { fecha: string; precio: number; estado: string; cancelable: number }[] = [];

	viewDate: Date = new Date();
	refresh: Subject<void> = new Subject<void>();
	events: CalendarEvent[] = [];
	view: CalendarView = CalendarView.Month;
	selectedDates: string[] = []; // <- ahora guardamos strings YYYY-MM-DD

	nuevoPrecio: number | null = null;
	nuevoEstado: string = 'disponible';
	nuevoCancelable: boolean = true;

	isDragging = false;
	unSelecting = false;
	dragStartDay: CalendarMonthViewDay | null = null;

	constructor(
		private disponibilidadService: DisponibilidadService,
		private http: HttpClient,
		private snackBar: MatSnackBar,
		private translate: TranslateService
	) { }

	ngOnInit(): void {
		this.disponibilidadService.getDisponibilidad().subscribe(data => {
			this.disponibilidad = data.map(d => ({
				...d,
				fecha: d.fecha.trim(),
				precio: Number(d.precio),
				cancelable: d.cancelable ?? 1
			}));

			this.events = this.disponibilidad.map(d => ({
				start: startOfDay(new Date(d.fecha)),
				title: '',
				color: this.getColor(d.estado),
				meta: {
					estado: d.estado,
					precio: d.precio,
					cancelable: d.cancelable ?? 1
				}
			}));

			this.refresh.next();
		});
	}

	previousMonth(): void {
		this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() - 1));
	}

	nextMonth(): void {
		this.viewDate = new Date(this.viewDate.setMonth(this.viewDate.getMonth() + 1));
	}

	getColor(estado: string): { primary: string, secondary: string } {
		switch (estado) {
			case 'disponible':
				return { primary: 'var(--color-neutral)', secondary: 'var(--color-neutral)' };
			case 'reservada':
				return { primary: 'var(--color-tertiary)', secondary: 'var(--color-tertiary)' };
			case 'cerrada':
				return { primary: 'var(--color-primary)', secondary: 'var(--color-primary)' };
			case 'booking':
				return { primary: 'var(--color-booking)', secondary: 'var(--color-booking)' };
			case 'airbnb':
				return { primary: 'var(--color-airbnb)', secondary: 'var(--color-airbnb)' };
			default:
				return { primary: 'var(--color-neutral)', secondary: 'var(--color-neutral)' };
		}
	}

	beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }) {
		body.forEach(day => {
			const event = this.events.find(e => e.start.toDateString() === day.date.toDateString());
			if (event) {
				day.cssClass = event.meta.estado;

				if (event.meta.estado === 'disponible') {
					(day as any).customPrice = event.meta.precio + ' €';
					(day as any).customIcon = null;
					(day as any).customMatIcon = 'event_available';
				} else if (event.meta.estado === 'booking') {
					(day as any).customIcon = 'assets/icons/booking.png';
					(day as any).customPrice = null;
					(day as any).customMatIcon = null;
				} else if (event.meta.estado === 'airbnb') {
					(day as any).customIcon = 'assets/icons/airbnb.png';
					(day as any).customPrice = null;
					(day as any).customMatIcon = null;
				} else if (event.meta.estado === 'reservada') {
					(day as any).customIcon = null;
					(day as any).customPrice = null;
					(day as any).customMatIcon = 'perm_contact_calendar';
				} else if (event.meta.estado === 'cerrada') {
					(day as any).customPrice = null;
					(day as any).customIcon = null;
					(day as any).customMatIcon = 'event_busy';
				} else {
					(day as any).customPrice = null;
					(day as any).customIcon = null;
					(day as any).customMatIcon = null;
				}

				// Indicador visual para días no cancelables
				if (event.meta.cancelable === 0) {
					day.cssClass += ' no-cancelable';
					(day as any).customSymbol = 'contract_delete';
				} else {
					(day as any).customSymbol = null;
				}

				// Comprobamos si está seleccionado basado en fecha
				if (this.selectedDates.includes(this.formatearFechaLocal(day.date))) {
					day.cssClass += ' selected';
				}
			}
		});
	}

	aplicarCambios(): void {
		if (!this.nuevoEstado) {
			this.snackBar.open(this.translate.instant('SNACKBAR.MUST-SELECT-STATE'), undefined, {
				duration: 3000,
				panelClass: ['snackbar-error']
			});
			return;
		}

		const diasActualizar = [...this.selectedDates];

		const payload = {
			fechas: diasActualizar,
			precio: this.nuevoPrecio,
			estado: this.nuevoEstado,
			cancelable: this.nuevoCancelable
		};

		this.http.post('/api/disponibilidad/actualizar', payload).subscribe({
			next: () => {
				diasActualizar.forEach(fechaStr => {
					const event = this.events.find(e => this.formatearFechaLocal(e.start) === fechaStr);
					if (event) {
						event.meta.precio = this.nuevoPrecio ?? event.meta.precio;
						event.meta.estado = this.nuevoEstado;
						event.meta.cancelable = this.nuevoCancelable ? 1 : 0;
					}
				});

				this.snackBar.open(this.translate.instant('SNACKBAR.CHANGES-APPLIED'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-success']
				});

				this.selectedDates = [];
				this.nuevoPrecio = null;
				this.nuevoEstado = 'disponible';
				this.nuevoCancelable = true;
				this.refresh.next();
			},
			error: (err) => {
				console.error('[admin-calendar] Error al aplicar cambios:', err);
				this.snackBar.open(this.translate.instant('SNACKBAR.CHANGES-ERROR'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-error']
				});
			}
		});
	}

	private formatearFechaLocal(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	startDrag(day: CalendarMonthViewDay): void {
		const event = this.events.find(e => e.start.toDateString() === day.date.toDateString());
		if (event && (event.meta.estado === 'disponible' || event.meta.estado === 'cerrada')) {
			const dateStr = this.formatearFechaLocal(day.date);
			if (this.selectedDates.includes(dateStr)) {
				this.unSelecting = true;
			}
			this.toggleDaySelection(day);
			this.isDragging = true;
			this.dragStartDay = day;
		}
	}

	dragOver(day: CalendarMonthViewDay): void {
		if (this.isDragging) {
			const event = this.events.find(e => e.start.toDateString() === day.date.toDateString());
			const dateStr = this.formatearFechaLocal(day.date);
			if (event && (event.meta.estado === 'disponible' || event.meta.estado === 'cerrada')) {
				if (!this.selectedDates.includes(dateStr) && !this.unSelecting) {
					this.selectedDates.push(dateStr);
					day.cssClass += ' selected';
				} else if (this.selectedDates.includes(dateStr) && this.unSelecting) {
					this.selectedDates = this.selectedDates.filter(d => d !== dateStr);
					day.cssClass = (day.cssClass || '').replace(' selected', '');
				}
			}
		}
	}

	endDrag(): void {
		if (this.dragStartDay && !this.isDragging) {
			this.toggleDaySelection(this.dragStartDay);
		}
		this.dragStartDay = null;
		this.isDragging = false;
		this.unSelecting = false;
	}

	toggleDaySelection(day: CalendarMonthViewDay): void {
		const dateStr = this.formatearFechaLocal(day.date);
		const index = this.selectedDates.indexOf(dateStr);

		if (index > -1) {
			this.selectedDates.splice(index, 1);
			day.cssClass = (day.cssClass || '').replace(' selected', '');
		} else {
			this.selectedDates.push(dateStr);
			day.cssClass += ' selected';
		}
	}
}
