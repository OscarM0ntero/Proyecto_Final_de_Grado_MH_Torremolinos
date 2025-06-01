// src/app/services/usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
    nombre: string;
    apellidos: string;
    email: string;
    prefijo: string;
    telefono: string;
}

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    constructor(private http: HttpClient) { }

    getUsuarioActual(): Observable<Usuario> {
        return this.http.get<Usuario>('/api/usuarios/me');
    }

    actualizarDatosUsuario(datos: Usuario): Observable<any> {
        return this.http.put('/api/usuarios/me', datos);
    }

    cambiarPassword(actual: string, nueva: string, confirmar: string): Observable<any> {
        return this.http.put('/api/usuarios/me/password', { actual, nueva, confirmar });
    }

    getUsuarioPorId(id: number): Observable<Usuario> {
        return this.http.get<Usuario>(`/api/usuarios/${id}`);
    }
}
