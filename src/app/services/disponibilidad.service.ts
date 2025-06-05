import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class DisponibilidadService {
	constructor(private http: HttpClient) { }

	getDisponibilidad(): Observable<{ fecha: string; precio: number; estado: string }[]> {
		return this.http.get<{ fecha: string; precio: number; estado: string }[]>(`/api/disponibilidad`);
	}

	getDisponibilidadPorMes(mes: string): Observable<{ fecha: string; precio: number; estado: string }[]> {
		return this.http.get<{ fecha: string; precio: number; estado: string }[]>(`/api/disponibilidad?mes=${mes}`);
	}

	actualizarDisponibilidad(data: { fechas: string[], precio?: number, estado: string }) {
		return this.http.post('/api/disponibilidad/actualizar', data);
	}
}
