import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
    private cargandoSubject = new BehaviorSubject<boolean>(false);
    cargando$ = this.cargandoSubject.asObservable();

    mostrar(): void {
        this.cargandoSubject.next(true);
    }

    ocultar(): void {
        this.cargandoSubject.next(false);
    }
}
