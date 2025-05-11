import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Contenido {
  id_contenido: number;
  titulo: string;
  texto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContenidoService {

  private readonly apiUrl = '/api/contenido'; // Angular SSR usa proxy relativo

  constructor(private http: HttpClient) { }

  getContenido(lang: string, pagina: string): Observable<Contenido[]> {
    const params = new HttpParams()
      .set('lang', lang)
      .set('pagina', pagina);

    return this.http.get<Contenido[]>(this.apiUrl, { params });
  }
}
