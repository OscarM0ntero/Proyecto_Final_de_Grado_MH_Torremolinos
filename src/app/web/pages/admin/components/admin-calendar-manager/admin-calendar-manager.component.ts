import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarEvent, CalendarMonthViewDay, CalendarView } from 'angular-calendar';
import { DisponibilidadService } from '../../../../../services/disponibilidad.service';
import { startOfDay } from 'date-fns';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-admin-calendar-manager',
	standalone: false,
	templateUrl: './admin-calendar-manager.component.html',
	styleUrls: ['./admin-calendar-manager.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AdminCalendarManagerComponent implements OnInit {
	disponibilidad: { fecha: string; precio: number; estado: string }[] = [];

	viewDate: Date = new Date();
	refresh: Subject<void> = new Subject<void>();
	events: CalendarEvent[] = [];
	view: CalendarView = CalendarView.Month;
	selectedDays: CalendarMonthViewDay[] = [];

	nuevoPrecio: number | null = null;
	nuevoEstado: string = 'disponible';

	isDragging = false;
	unSelecting = false;
	dragStartDay: CalendarMonthViewDay | null = null;

	constructor(
		private disponibilidadService: DisponibilidadService,
		private http: HttpClient,
		private snackBar: MatSnackBar
	) { }

	ngOnInit(): void {
		this.disponibilidadService.getDisponibilidad().subscribe(data => {
			this.disponibilidad = data.map(d => ({
				...d,
				fecha: d.fecha.trim(),
				precio: Number(d.precio)
			}));

			// Crear los eventos
			this.events = this.disponibilidad.map(d => ({
				start: startOfDay(new Date(d.fecha)),
				title: '', // No queremos título
				color: this.getColor(d.estado),
				meta: {
					estado: d.estado,
					precio: d.precio
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
			}
		});
	}

	dayClicked(day: CalendarMonthViewDay): void {
		const event = this.events.find(e => e.start.toDateString() === day.date.toDateString());
		if (!event) {
			return;
		}

		const estado = event.meta.estado;
		if (estado === 'disponible' || estado === 'cerrada') {
			const index = this.selectedDays.indexOf(day);
			if (index > -1) {
				this.selectedDays.splice(index, 1);
				day.cssClass = event.meta.estado; // Volver a su estado normal
			} else {
				this.selectedDays.push(day);
				day.cssClass = (event.meta.estado ?? '') + ' selected'; // Añadimos la clase 'seleccionado'
			}
		}
	}


	aplicarCambios(): void {
		if (!this.nuevoEstado) {
			this.snackBar.open('Debes seleccionar un estado', 'Cerrar', {
				duration: 3000,
				panelClass: ['snackbar-error']
			});
			return;
		}

		const diasActualizar = this.selectedDays.map(d => this.formatearFechaLocal(d.date));

		const payload = {
			fechas: diasActualizar,
			precio: this.nuevoPrecio,
			estado: this.nuevoEstado
		};

		this.http.post('/api/disponibilidad/actualizar', payload).subscribe({
			next: () => {
				// Éxito: actualizamos el frontend como antes
				diasActualizar.forEach(fechaStr => {
					const event = this.events.find(e => this.formatearFechaLocal(e.start) === fechaStr);
					if (event) {
						event.meta.precio = this.nuevoPrecio ?? event.meta.precio;
						event.meta.estado = this.nuevoEstado;
					}
				});

				this.snackBar.open('Cambios aplicados correctamente', 'Cerrar', {
					duration: 3000,
					panelClass: ['snackbar-success']
				});

				this.selectedDays = [];
				this.nuevoPrecio = null;
				this.nuevoEstado = 'disponible';
				this.refresh.next(); // Refrescamos el calendario visual
			},
			error: (err) => {
				console.error(err);
				this.snackBar.open('Error al aplicar cambios', 'Cerrar', {
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
			if (this.selectedDays.includes(day)) {
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
			if (event && (event.meta.estado === 'disponible' || event.meta.estado === 'cerrada')) {
				if (!this.selectedDays.includes(day) && !this.unSelecting) {
					this.selectedDays.push(day);
					day.cssClass += ' selected';
				} else if (this.selectedDays.includes(day) && this.unSelecting) {
					this.selectedDays = this.selectedDays.filter(d => d !== day);
					day.cssClass = (day.cssClass || '').replace(' selected', '');
				}
			}
		}
	}


	endDrag(): void {
		if (this.dragStartDay && !this.isDragging) {
			// Si no hubo drag (simple click), selecciona el día
			this.toggleDaySelection(this.dragStartDay);
		}
		this.dragStartDay = null;
		this.isDragging = false;
		this.unSelecting = false;
	}


	toggleDaySelection(day: CalendarMonthViewDay): void {
		if (this.selectedDays.includes(day)) {
			// Ya está seleccionado → deseleccionar
			this.selectedDays = this.selectedDays.filter(d => d !== day);
			day.cssClass = (day.cssClass || '').replace(' selected', '');
		} else {
			// No está seleccionado → seleccionar
			this.selectedDays.push(day);
			day.cssClass += ' selected';
		}
	}



}
