import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ContactService {
    constructor(private http: HttpClient) { }

    enviarMensaje(data: {
        nombre: string;
        email: string;
        telefono: string;
        mensaje: string;
        recaptcha: string;
    }) {
        return this.http.post('/api/contact', data);
    }
}
