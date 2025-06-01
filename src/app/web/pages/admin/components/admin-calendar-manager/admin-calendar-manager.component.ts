import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarEvent, CalendarMonthViewDay, CalendarView } from 'angular-calendar';
import { DisponibilidadService } from '../../../../../services/disponibilidad.service';
import { startOfDay } from 'date-fns';
import { Subject } from 'rxjs';

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

	constructor(private disponibilidadService: DisponibilidadService) { }

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
			if (this.selectedDays.includes(day)) {
				this.selectedDays = this.selectedDays.filter(d => d !== day);
			} else {
				this.selectedDays.push(day);
			}
		}
	}
}
