import { Component } from '@angular/core';
import { ContenidoWebService } from '../../../services/contenido-web.service';
import { TranslateService } from '@ngx-translate/core';
import { ContenidoBaseComponent } from '../../../shared/contenido-base.component';
import { HttpClient } from '@angular/common/http';
import { ImagenesService } from '../../../services/imagenes.service';
import { ContenidoService } from '../../../services/contenido.service';
import { Title, Meta } from '@angular/platform-browser';
import { DisponibilidadService } from '../../../services/disponibilidad.service';
import { ResenasService, Resena } from '../../../services/resenas.service';


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
	itemPuntuacion = '';
	precioMinimo: number | null = null;

	resenaResponsiveOptions = [
		{ breakpoint: '1200px', numVisible: 3, numScroll: 1 },
		{ breakpoint: '768px', numVisible: 1, numScroll: 1 },
	];

	bookingReviewsUrl = 'https://www.booking.com/hotel/es/m-amp-h-torremolinos.html?#tab-reviews';

	resenas: Resena[] = [];

	constructor(
		contenido: ContenidoService,
		contenidoWeb: ContenidoWebService,
		imagenes: ImagenesService,
		translate: TranslateService,
		private titleService: Title,
		private metaService: Meta,
		private disponibilidadService: DisponibilidadService,
		private resenasService: ResenasService
	) {
		super(contenido, contenidoWeb, imagenes, translate, 'home');
	}

	override async ngOnInit(): Promise<void> {
		await super.ngOnInit();

		this.disponibilidadService.getPrecioMinimo().subscribe({
			next: (data) => { this.precioMinimo = data.precio_minimo; },
			error: () => { this.precioMinimo = null; }
		});

		this.resenasService.getResenas().subscribe({
			next: (data: Resena[]) => { this.resenas = data; },
			error: () => { this.resenas = []; }
		});

		this.titleService.setTitle('M&H Torremolinos');
		this.metaService.updateTag({ name: 'description', content: 'Apartamento turístico en Torremolinos. 5 huéspedes, WiFi gratis, mascotas permitidas, ubicación ideal cerca de la playa.' });
		this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
		this.metaService.updateTag({ name: 'keywords', content: 'apartamento, Torremolinos, vacaciones, Costa del Sol, alquiler turístico' });
		
		this.metaService.updateTag({ property: 'og:title', content: 'M&H Torremolinos - Tu apartamento en la Costa del Sol' });
		this.metaService.updateTag({ property: 'og:description', content: 'Alojamiento ideal en Torremolinos para 5 personas y mascotas. Reserva tu estancia perfecta.' });
		this.metaService.updateTag({ property: 'og:image', content: 'https://www.mhtorremolinos.com/assets/favicon.png' });
		this.metaService.updateTag({ property: 'og:url', content: 'https://www.mhtorremolinos.com' });
		this.metaService.updateTag({ property: 'og:type', content: 'website' });
	}

	protected actualizarContenido(): void {
		this.itemLema = this.getTexto(1);
		this.itemCamaDoble = this.getTexto(2);
		this.itemCamasInd = this.getTexto(3);
		this.itemCuna = this.getTexto(4);
		this.itemApartado1 = this.getContenido(5);
		this.itemApartado2 = this.getContenido(6);
		this.itemPuntuacion = this.getTexto(11);
	}
}
