import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class DisponibilidadService {
	constructor(private http: HttpClient) { }

	getDisponibilidad(): Observable<{ fecha: string; precio: number; estado: string; cancelable: number }[]> {
		return this.http.get<{ fecha: string; precio: number; estado: string; cancelable: number }[]>(`/api/disponibilidad`);
	}

	getDisponibilidadPorMes(mes: string): Observable<{ fecha: string; precio: number; estado: string; cancelable: number }[]> {
		return this.http.get<{ fecha: string; precio: number; estado: string; cancelable: number }[]>(`/api/disponibilidad?mes=${mes}`);
	}

	actualizarDisponibilidad(data: { fechas: string[], precio?: number, estado: string, cancelable?: boolean | null }) {
		return this.http.post('/api/disponibilidad/actualizar', data);
	}

	getPrecioMinimo(): Observable<{ precio_minimo: number | null }> {
		return this.http.get<{ precio_minimo: number | null }>('/api/disponibilidad/precio-minimo');
	}
}
