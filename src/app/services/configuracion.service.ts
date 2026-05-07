import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ConfiguracionService {
    constructor(private http: HttpClient) { }

    getValor(clave: string): Observable<{ clave: string; valor: string; descripcion: string }> {
        return this.http.get<any>(`/api/configuracion/${clave}`);
    }

    setValor(clave: string, valor: string): Observable<any> {
        return this.http.put(`/api/configuracion/${clave}`, { valor });
    }
}
