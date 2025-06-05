import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Contenido, ContenidoService } from '../../../../../services/contenido.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-content-editor',
	standalone: false,
	templateUrl: './content-editor.component.html',
	styleUrl: './content-editor.component.scss'
})
export class ContentEditorComponent implements OnInit {
	page: string = '';
	contenidos: Contenido[] = [];
	idiomas = ['es', 'en', 'de', 'no'];

	constructor(
		private route: ActivatedRoute,
		private contenidoService: ContenidoService,
		private snackBar: MatSnackBar,
		private translate: TranslateService
	) { }

	ngOnInit(): void {
		this.page = this.route.snapshot.data['page'] || 'home';

		this.contenidoService.getContenido(this.page).subscribe((data) => {
			this.contenidos = data;
		});
	}

	getValor(contenido: any, campo: string): string {
		return contenido[campo] || '';
	}

	setValor(contenido: any, campo: string, valor: string): void {
		contenido[campo] = valor;
	}

	guardarCambios(contenido: Contenido): void {
		this.contenidoService.updateContenido(contenido.id_contenido, contenido).subscribe({
			next: () => {
				this.snackBar.open(this.translate.instant('SNACKBAR.CONTENT-SAVED'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-success']
				});
				this.contenidoService.recargarContenido(contenido.pagina);
			},
			error: () => {
				this.snackBar.open(this.translate.instant('SNACKBAR.CONTENT-SAVED-ERROR'), undefined, {
					duration: 3000,
					panelClass: ['snackbar-error']
				});
			}
		});
	}
}
