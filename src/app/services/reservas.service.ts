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
	fecha_creacion: string;
	estado_reserva: string;
	actualizado: string;
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
}

@Injectable({
	providedIn: 'root'
})
export class ReservasService {
	constructor(private http: HttpClient) { }

	getReservasCliente(): Observable<Reserva[]> {
		return this.http.get<Reserva[]>('/api/reservas/cliente');
	}


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

	actualizarEstadoReserva(id: number, estado: string): Observable<any> {
		return this.http.put(`/api/reservas/${id}/estado`, { estado });
	}


}
