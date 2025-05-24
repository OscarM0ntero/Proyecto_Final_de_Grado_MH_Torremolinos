import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {
  constructor(private http: HttpClient) {}

  // Nuevo: disponibilidad global
  getDisponibilidad(): Observable<{ fecha: string; precio: number; estado: string }[]> {
    return this.http.get<{ fecha: string; precio: number; estado: string }[]>(`/api/disponibilidad`);
  }

  // El original por mes (sin cambiar ruta)
  getDisponibilidadPorMes(mes: string): Observable<{ fecha: string; precio: number; estado: string }[]> {
    return this.http.get<{ fecha: string; precio: number; estado: string }[]>(`/api/disponibilidad?mes=${mes}`);
  }
}
