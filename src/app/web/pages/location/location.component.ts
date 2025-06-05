import { Component } from '@angular/core';
import { ContenidoBaseComponent } from '../../../shared/contenido-base.component';
import { ContenidoService } from '../../../services/contenido.service';
import { TranslateService } from '@ngx-translate/core';
import { ImagenesService } from '../../../services/imagenes.service';
import { ContenidoWebService } from '../../../services/contenido-web.service';

@Component({
	selector: 'app-location',
	standalone: false,
	templateUrl: './location.component.html',
	styleUrl: './location.component.scss'
})
export class LocationComponent extends ContenidoBaseComponent {

	itemUbicacion: any;

	constructor(
		contenido: ContenidoService,
		contenidoWeb: ContenidoWebService,
		imagenes: ImagenesService,
		translate: TranslateService,
	) {
		super(contenido, contenidoWeb, imagenes, translate, 'location');
	}

	protected actualizarContenido(): void {
		this.itemUbicacion = this.getContenido(19);
	}


}
