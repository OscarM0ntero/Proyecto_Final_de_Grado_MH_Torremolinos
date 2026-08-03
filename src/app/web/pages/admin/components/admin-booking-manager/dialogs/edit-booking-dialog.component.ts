// Diálogo de edición de una reserva desde el panel de administración.
// Solo expone lo que es seguro cambiar: el precio y el estado del pago no se tocan aquí,
// porque deben reflejar siempre lo ocurrido en Stripe.
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Reserva } from '../../../../../../services/reservas.service';
import { PREFIJOS_TELEFONO } from '../../../../../../shared/prefijos';

@Component({
	selector: 'app-edit-booking-dialog',
	standalone: false,
	templateUrl: './edit-booking-dialog.component.html',
	styleUrl: './edit-booking-dialog.component.scss'
})
export class EditBookingDialogComponent {
	prefijos = PREFIJOS_TELEFONO;
	form: any;
	fechaInicio: Date;
	fechaFin: Date;

	constructor(
		public dialogRef: MatDialogRef<EditBookingDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public reserva: Reserva
	) {
		this.form = {
			cliente_nombre: reserva.nombre || reserva.cliente_nombre || '',
			cliente_apellidos: reserva.apellidos || reserva.cliente_apellidos || '',
			cliente_email: reserva.email || reserva.cliente_email || '',
			cliente_prefijo: reserva.prefijo || reserva.cliente_prefijo || '+34',
			cliente_telefono: reserva.telefono || reserva.cliente_telefono || '',
			n_personas: reserva.n_personas,
			bebe: !!reserva.bebe,
			mascota: !!reserva.mascota,
			nota_admin: (reserva as any).nota_admin || ''
		};
		this.fechaInicio = new Date(reserva.fecha_inicio);
		this.fechaFin = new Date(reserva.fecha_fin);
	}

	get fechasCambiadas(): boolean {
		return this.fechaInicio.getTime() !== new Date(this.reserva.fecha_inicio).getTime()
			|| this.fechaFin.getTime() !== new Date(this.reserva.fecha_fin).getTime();
	}

	private aFechaLocal(f: Date): string {
		const y = f.getFullYear();
		const m = (f.getMonth() + 1).toString().padStart(2, '0');
		const d = f.getDate().toString().padStart(2, '0');
		return `${y}-${m}-${d}`;
	}

	guardar(): void {
		this.dialogRef.close({
			...this.form,
			fecha_inicio: this.aFechaLocal(this.fechaInicio),
			fecha_fin: this.aFechaLocal(this.fechaFin)
		});
	}
}
