import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ContenidoWebService } from '../../../services/contenido-web.service';
import { TranslateService } from '@ngx-translate/core';
import { ContenidoBaseComponent } from '../../../shared/contenido-base.component';
import { ImagenesService } from '../../../services/imagenes.service';
import { ContenidoService } from '../../../services/contenido.service';

@Component({
	selector: 'app-gallery',
	standalone: false,
	templateUrl: './gallery.component.html',
	styleUrl: './gallery.component.scss',
})
export class GalleryComponent extends ContenidoBaseComponent {
	displayCustom = false;
	activeIndex = 0;

	constructor(
		contenido: ContenidoService,
		contenidoWeb: ContenidoWebService,
		imagenes: ImagenesService,
		translate: TranslateService,
		@Inject(PLATFORM_ID) private platformId: Object
	) {
		super(contenido, contenidoWeb, imagenes, translate, 'gallery');
	}

	protected actualizarContenido(): void { }


	imageClick(index: number) {
		if (isPlatformBrowser(this.platformId) && window.matchMedia('(min-width: 1024px)').matches) {
			this.activeIndex = index;
			this.displayCustom = true;
		}

	}

}
