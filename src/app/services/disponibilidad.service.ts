import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
    constructor(private http: HttpClient) { }

    getDisponibilidad(mes: string) {
        return this.http.get<any[]>(`/api/disponibilidad?mes=${mes}`);
    }
}
