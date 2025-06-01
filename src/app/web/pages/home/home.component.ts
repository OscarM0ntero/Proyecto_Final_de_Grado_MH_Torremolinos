import { Component } from '@angular/core';
import { ContenidoWebService } from '../../../services/contenido-web.service';
import { TranslateService } from '@ngx-translate/core';
import { ContenidoBaseComponent } from '../../../shared/contenido-base.component';
import { HttpClient } from '@angular/common/http';
import { ImagenesService } from '../../../services/imagenes.service';
import { ContenidoService } from '../../../services/contenido.service';


@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  host: { ngSkipHydration: 'true' },
})
export class HomeComponent extends ContenidoBaseComponent {
  itemLema = '';
  itemCamaDoble = '';
  itemCamasInd = '';
  itemCuna = '';
  itemApartado1: any;
  itemApartado2: any;

  constructor(
    contenido: ContenidoService,
    contenidoWeb: ContenidoWebService,
    imagenes: ImagenesService,
    translate: TranslateService,
  ) {
    super(contenido, contenidoWeb, imagenes, translate, 'home');
  }

  protected actualizarContenido(): void {
    this.itemLema = this.getTexto(1);
    this.itemCamaDoble = this.getTexto(2);
    this.itemCamasInd = this.getTexto(3);
    this.itemCuna = this.getTexto(4);
    this.itemApartado1 = this.getContenido(5);
    this.itemApartado2 = this.getContenido(6);
  }
}
