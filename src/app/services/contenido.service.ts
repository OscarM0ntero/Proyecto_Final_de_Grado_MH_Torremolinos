import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export type Contenido = {
	[key in `texto_${'es' | 'en' | 'de' | 'no'}`]: string;
} & {
	[key in `titulo_${'es' | 'en' | 'de' | 'no'}`]: string;
} & {
	id_contenido: number;
	pagina: string;
};

@Injectable({
	providedIn: 'root'
})
export class ContenidoService {
	private apiUrl = environment.webUrl + 'api/contenido';
	private recargaSubject = new Subject<string>();

	recarga$ = this.recargaSubject.asObservable();

	constructor(private http: HttpClient) { }

	getContenido(pagina: string, lang?: string): Observable<Contenido[]> {
		let params = new HttpParams().set('pagina', pagina);
		if (lang) {
			params = params.set('lang', lang);
		}

		return this.http.get<Contenido[]>(this.apiUrl, { params });
	}

	updateContenido(id: number, datos: Partial<Contenido>): Observable<any> {
		return this.http.put(`${this.apiUrl}/${id}`, datos);
	}

	recargarContenido(pagina: string): void {
		this.recargaSubject.next(pagina);
	}

}
