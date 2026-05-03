import { Component, OnInit, ViewChild } from '@angular/core';
import { ContenidoWebService } from '../../../services/contenido-web.service';
import { Contenido, ContenidoService } from '../../../services/contenido.service';
import { TranslateService } from '@ngx-translate/core';
import { ContenidoBaseComponent } from '../../../shared/contenido-base.component';
import { ImagenesService } from '../../../services/imagenes.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactService } from '../../../services/contact.service';
import { RecaptchaComponent } from 'ng-recaptcha-2';
import { environment } from '../../../../environments/environment';
import { PREFIJOS_TELEFONO } from '../../../shared/prefijos';
import { LayoutComponent } from '../layout/layout.component';

@Component({
	selector: 'app-contact',
	standalone: false,
	templateUrl: './contact.component.html',
	styleUrl: './contact.component.scss'
})
export class ContactComponent extends ContenidoBaseComponent implements OnInit {
	@ViewChild('captchaRef') captchaRef!: RecaptchaComponent;
	siteKey = environment.recaptchaSiteKey;

	prefijos = PREFIJOS_TELEFONO;
	email: any;
	tlf: any;

	tokenCaptcha: string = '';

	form = {
		nombre: '',
		email: '',
		prefijo: '+34',
		telefono: '',
		mensaje: ''
	};

	constructor(
		contenido: ContenidoService,
		contenidoWeb: ContenidoWebService,
		imagenes: ImagenesService,
		translate: TranslateService,
		private contactService: ContactService,
		private snackBar: MatSnackBar,
		public layout: LayoutComponent
	) {
		super(contenido, contenidoWeb, imagenes, translate, 'contact');
	}

	override async ngOnInit(): Promise<void> {
		await super.ngOnInit();

		this.layout.captchaResuelto$.subscribe(token => {
			this.tokenCaptcha = token;
			this.enviarMensaje();
		});
	}

	protected actualizarContenido(): void {
		//this.itemLema = this.getTexto(1);
		this.email = this.getContenido(7);
		this.tlf = this.getContenido(8);
	}

	verificarCaptcha(): void {
		this.layout.captchaRef?.execute();
	}

	onCaptchaResuelto(token: string): void {
		this.tokenCaptcha = token;
		this.enviarMensaje();
	}

	enviarMensaje(): void {
		if (!this.tokenCaptcha) return;

		const data = {
			nombre: this.form.nombre,
			email: this.form.email,
			telefono: `${this.form.prefijo} ${this.form.telefono}`,
			mensaje: this.form.mensaje,
			recaptcha: this.tokenCaptcha
		};

		this.contactService.enviarMensaje(data).subscribe({
			next: () => {
				this.snackBar.open(this.translate.instant('SNACKBAR.MESSAGE-SENT'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-success']
				});
				this.form = { nombre: '', email: '', prefijo: '+34', telefono: '', mensaje: '' };
				this.tokenCaptcha = '';
				this.layout.resetCaptcha();
			},
			error: () => {
				this.snackBar.open(this.translate.instant('SNACKBAR.MESSAGE-SENT-ERROR'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-error']
				});
				this.tokenCaptcha = '';
				this.layout.resetCaptcha();
			}
		});
	}


}
