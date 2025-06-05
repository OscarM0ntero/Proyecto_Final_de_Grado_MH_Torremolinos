import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContenidoBaseComponent } from '../../../shared/contenido-base.component';
import { TranslateService } from '@ngx-translate/core';
import { ContenidoWebService } from '../../../services/contenido-web.service';
import { ContenidoService } from '../../../services/contenido.service';
import { ImagenesService } from '../../../services/imagenes.service';

@Component({
	selector: 'app-legal',
	standalone: false,
	templateUrl: './legal.component.html',
	styleUrl: './legal.component.scss'
})
export class LegalComponent extends ContenidoBaseComponent {
	itemAviso: any;
	itemPrivacidad: any;
	itemCookies: any;
	itemCondiciones: any;
	itemIntelectual: any;
	itemLey: any;

	constructor(
		contenido: ContenidoService,
		contenidoWeb: ContenidoWebService,
		imagenes: ImagenesService,
		translate: TranslateService,
		private route: ActivatedRoute,
		private viewportScroller: ViewportScroller
	) {
		super(contenido, contenidoWeb, imagenes, translate, 'legal');
	}

	protected actualizarContenido(): void {
		this.itemAviso = this.getContenido(20);
		this.itemPrivacidad = this.getContenido(21);
		this.itemCookies = this.getContenido(22);
		this.itemCondiciones = this.getContenido(23);
		this.itemIntelectual = this.getContenido(24);
		this.itemLey = this.getContenido(25);
	}

	override async ngOnInit(): Promise<void> {
		await super.ngOnInit();

		this.route.fragment.subscribe(fragment => {
			if (fragment) {
				setTimeout(() => {
					const element = document.getElementById(fragment);
					if (element) {
						element.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}
				}, 100);
			}
		});
	}

}
