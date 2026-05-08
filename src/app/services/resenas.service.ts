import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Resena {
	id_resena?: number;
	nombre: string;
	pais: string;
	iso: string;
	puntuacion: number;
	texto_positivo: string;
	texto_negativo: string;
	fecha_estancia: string;
	activa: number;
}

@Injectable({ providedIn: 'root' })
export class ResenasService {
	private apiUrl = '/api/resenas';

	constructor(private http: HttpClient) {}

	getResenas(): Observable<Resena[]> {
		return this.http.get<Resena[]>(this.apiUrl);
	}

	getAllResenas(): Observable<Resena[]> {
		return this.http.get<Resena[]>(`${this.apiUrl}/all`);
	}

	createResena(resena: Omit<Resena, 'id_resena'>): Observable<{ id_resena: number }> {
		return this.http.post<{ id_resena: number }>(this.apiUrl, resena);
	}

	updateResena(id: number, resena: Omit<Resena, 'id_resena'>): Observable<any> {
		return this.http.put(`${this.apiUrl}/${id}`, resena);
	}

	deleteResena(id: number): Observable<any> {
		return this.http.delete(`${this.apiUrl}/${id}`);
	}
}
