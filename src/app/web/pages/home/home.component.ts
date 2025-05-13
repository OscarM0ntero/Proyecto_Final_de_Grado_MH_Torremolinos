import { Component, OnInit } from '@angular/core';
import { ContenidoWebService } from '../../../services/contenido-web.service';
import { Contenido } from '../../../services/contenido.service';
import { TranslateService } from '@ngx-translate/core';
import { ContenidoBaseComponent } from '../../../shared/contenido-base.component';


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
    contenidoWeb: ContenidoWebService,
    translate: TranslateService
  ) {
    super(contenidoWeb, translate, 'home');
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
