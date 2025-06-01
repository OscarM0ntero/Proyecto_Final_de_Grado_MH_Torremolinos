import { Component } from '@angular/core';
import { ContenidoBaseComponent } from '../../../shared/contenido-base.component';
import { ContenidoWebService } from '../../../services/contenido-web.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ImagenesService } from '../../../services/imagenes.service';
import { ContenidoService } from '../../../services/contenido.service';

@Component({
  selector: 'app-apartment',
  standalone: false,
  templateUrl: './apartment.component.html',
  styleUrl: './apartment.component.scss'
})
export class ApartmentComponent extends ContenidoBaseComponent {

  constructor(
    contenido: ContenidoService,
    contenidoWeb: ContenidoWebService,
    imagenes: ImagenesService,
    translate: TranslateService,
  ) {
    super(contenido, contenidoWeb, imagenes, translate, 'apartment');
  }

  protected actualizarContenido(): void {
  }
}
