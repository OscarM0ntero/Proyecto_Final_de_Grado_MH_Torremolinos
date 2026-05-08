import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResenasService, Resena } from '../../../../../services/resenas.service';

@Component({
	selector: 'app-admin-resenas-manager',
	standalone: false,
	templateUrl: './admin-resenas-manager.component.html',
	styleUrl: './admin-resenas-manager.component.scss'
})
export class AdminResenasManagerComponent implements OnInit {

	resenas: Resena[] = [];
	editando: Resena | null = null;
	creando = false;

	form: Omit<Resena, 'id_resena'> = this.formVacio();

	constructor(
		private resenasService: ResenasService,
		private snackBar: MatSnackBar
	) {}

	ngOnInit(): void {
		this.cargarResenas();
	}

	cargarResenas(): void {
		this.resenasService.getAllResenas().subscribe({
			next: (data: Resena[]) => { this.resenas = data; },
			error: () => this.snackBar.open('Error al cargar reseñas', undefined, { duration: 3000, panelClass: ['snackbar-error'] })
		});
	}

	nuevaResena(): void {
		this.creando = true;
		this.editando = null;
		this.form = this.formVacio();
	}

	editar(resena: Resena): void {
		this.editando = resena;
		this.creando = false;
		this.form = {
			nombre: resena.nombre,
			pais: resena.pais,
			iso: resena.iso,
			titulo: resena.titulo,
			puntuacion: resena.puntuacion,
			texto_positivo: resena.texto_positivo,
			texto_negativo: resena.texto_negativo,
			fecha_estancia: resena.fecha_estancia,
			activa: resena.activa
		};
	}

	guardar(): void {
		if (this.editando?.id_resena) {
			this.resenasService.updateResena(this.editando.id_resena, this.form).subscribe({
				next: () => {
					this.snackBar.open('Reseña actualizada', undefined, { duration: 3000, panelClass: ['snackbar-success'] });
					this.cancelar();
					this.cargarResenas();
				},
				error: () => this.snackBar.open('Error al actualizar', undefined, { duration: 3000, panelClass: ['snackbar-error'] })
			});
		} else {
			this.resenasService.createResena(this.form).subscribe({
				next: () => {
					this.snackBar.open('Reseña creada', undefined, { duration: 3000, panelClass: ['snackbar-success'] });
					this.cancelar();
					this.cargarResenas();
				},
				error: () => this.snackBar.open('Error al crear', undefined, { duration: 3000, panelClass: ['snackbar-error'] })
			});
		}
	}

	eliminar(id: number): void {
		if (!confirm('¿Eliminar esta reseña?')) return;
		this.resenasService.deleteResena(id).subscribe({
			next: () => {
				this.snackBar.open('Reseña eliminada', undefined, { duration: 3000, panelClass: ['snackbar-success'] });
				this.cargarResenas();
			},
			error: () => this.snackBar.open('Error al eliminar', undefined, { duration: 3000, panelClass: ['snackbar-error'] })
		});
	}

	cancelar(): void {
		this.editando = null;
		this.creando = false;
		this.form = this.formVacio();
	}

	private formVacio(): Omit<Resena, 'id_resena'> {
		return { nombre: '', pais: '', iso: '', titulo: '', puntuacion: 10, texto_positivo: '', texto_negativo: '', fecha_estancia: '', activa: 1 };
	}
}
