import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
	id_usuario: number;
	nombre: string;
	apellidos: string;
	email: string;
	prefijo: string;
	telefono: string;
	rol: 'cliente' | 'administrador';
}

export interface UsuarioPerfil {
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

	getUsuarioActual(): Observable<UsuarioPerfil> {
		return this.http.get<Usuario>('/api/usuarios/me');
	}

	actualizarDatosUsuario(datos: UsuarioPerfil): Observable<any> {
		return this.http.put('/api/usuarios/me', datos);
	}

	cambiarPassword(actual: string, nueva: string, confirmar: string): Observable<any> {
		return this.http.put('/api/usuarios/me/password', { actual, nueva, confirmar });
	}

	getUsuarioPorId(id: number): Observable<Usuario> {
		return this.http.get<Usuario>(`/api/usuarios/${id}`);
	}

	getUsuarios(): Observable<Usuario[]> {
		return this.http.get<Usuario[]>('/api/usuarios');
	}

	actualizarUsuario(id: number, datos: Usuario): Observable<any> {
		return this.http.put(`/api/usuarios/${id}`, datos);
	}

	eliminarUsuario(id: number): Observable<any> {
		return this.http.delete(`/api/usuarios/${id}`);
	}

	crearUsuario(payload: Usuario): Observable<any> {
		return this.http.post('/api/usuarios/crear', payload);
	}

	recoverPassword(email: string): Observable<any> {
		return this.http.post('/api/usuarios/recover', { email });
	}

}
