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

	images1: any[] = [];
	images2: any[] = [];

	itemApartamento: any;
	itemDistribucion: any;
	itemComodidades: any;
	itemMascotas: any;
	itemPiscina: any;
	itemEstacionamiento: any;

	constructor(
		contenido: ContenidoService,
		contenidoWeb: ContenidoWebService,
		imagenes: ImagenesService,
		translate: TranslateService,
	) {
		super(contenido, contenidoWeb, imagenes, translate, 'apartment');
	}

	protected actualizarContenido(): void {
		this.itemApartamento = this.getContenido(13);
		this.itemDistribucion = this.getContenido(14);
		this.itemComodidades = this.getContenido(15);
		this.itemMascotas = this.getContenido(16);
		this.itemPiscina = this.getContenido(17);
		this.itemEstacionamiento = this.getContenido(18);
	}

	override async ngOnInit(): Promise<void> {
		await super.ngOnInit();

		// Espera a que images se carguen
		this.imagenes.loadImages(this.nombrePagina).subscribe((imgs) => {
			this.images = imgs;
			this.images1 = this.images.slice(0, 3);
			this.images2 = this.images.slice(3, 6);
		});
	}

}
