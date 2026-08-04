// Aviso de cookies. Aparece hasta que el visitante decide.
//
// Aceptar y Rechazar tienen el mismo peso visual y cuestan lo mismo (un clic): la AEPD
// exige que rechazar sea tan fácil como aceptar, y prohíbe los muros que obligan a aceptar
// para poder usar la web. Por eso no se bloquea la navegación ni el scroll.
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ConsentimientoService } from '../../../../../services/consentimiento.service';

@Component({
	selector: 'app-cookie-banner',
	standalone: false,
	templateUrl: './cookie-banner.component.html',
	styleUrl: './cookie-banner.component.scss'
})
export class CookieBannerComponent implements OnInit {
	visible = false;

	constructor(
		private consentimiento: ConsentimientoService,
		@Inject(PLATFORM_ID) private platformId: Object
	) { }

	ngOnInit(): void {
		// El servidor no puede leer localStorage, así que no sabe si ya se decidió: si pintara
		// el aviso, lo mandaría en el HTML a quien ya lo había aceptado. El cliente lo decide.
		if (!isPlatformBrowser(this.platformId)) return;
		this.consentimiento.decision$.subscribe(d => this.visible = d === null);
	}

	aceptar(): void {
		this.consentimiento.aceptar();
	}

	rechazar(): void {
		this.consentimiento.rechazar();
	}
}
