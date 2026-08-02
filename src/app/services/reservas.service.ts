import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reserva {
	id_reserva: number;
	id_usuario: number;
	fecha_inicio: string;
	fecha_fin: string;
	n_personas: number;
	bebe: boolean;
	mascota: boolean;
	nota_adicional: string;
	precio_total: number;
	tipo_tarifa: 'cancelable' | 'no_cancelable';
	descuento_aplicado: number;
	// Snapshot de configuración en el momento de la reserva
	dias_cancelacion: number;
	precio_mascota_noche: number;
	fecha_creacion: string;
	estado_reserva: string;
	actualizado: string;
	// Pago con Stripe
	estado_pago?: 'pendiente' | 'pagado' | 'reembolsado';
	importe_pagado?: number;
	stripe_checkout_session_id?: string;
	stripe_payment_intent_id?: string;
	token_acceso?: string;
	// Datos del usuario activo (via JOIN, si la cuenta existe)
	nombre?: string;
	apellidos?: string;
	email?: string;
	prefijo?: string;
	telefono?: string;
	// Snapshot guardado en el momento de la reserva (persiste aunque se elimine la cuenta)
	cliente_nombre?: string;
	cliente_apellidos?: string;
	cliente_email?: string;
	cliente_prefijo?: string;
	cliente_telefono?: string;
	cliente_idioma?: string;
	cliente_pais?: string;
}

@Injectable({
	providedIn: 'root'
})
export class ReservasService {
	constructor(private http: HttpClient) { }

	getTodasReservas(): Observable<Reserva[]> {
		return this.http.get<Reserva[]>('/api/reservas');
	}

	getReservasPorEstado(estado: string): Observable<Reserva[]> {
		let params = new HttpParams().set('estado', estado);
		return this.http.get<Reserva[]>('/api/reservas', { params });
	}

	enviarReserva(payload: any): Observable<any> {
		return this.http.post('/api/reservas', payload);
	}

	getStripeConfig(): Observable<{ activo: boolean }> {
		return this.http.get<{ activo: boolean }>('/api/stripe/config');
	}

	actualizarEstadoReserva(id: number, estado: string): Observable<any> {
		return this.http.put(`/api/reservas/${id}/estado`, { estado });
	}


}
