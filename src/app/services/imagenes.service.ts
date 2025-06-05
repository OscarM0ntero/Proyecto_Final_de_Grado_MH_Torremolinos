import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { DeleteImgConfirmDialogComponent } from '../web/pages/admin/components/dialogs/delete-img-confirm-dialog.component';

@Injectable({
	providedIn: 'root'
})
export class ImagenesService {

	constructor(private http: HttpClient, private dialog: MatDialog) { }

	loadImages(pagina: string): Observable<any[]> {
		return this.http.get<any[]>('/api/imagenes?pagina=' + pagina).pipe(
			map(res =>
				res.map(img => ({
					id: img.id,
					url: `/uploads/${img.url}`,
					url_thumbnail: `/uploads/${img.url_thumbnail || img.url}`,
					alt: img.alt,
					orden: img.orden
				}))
			)
		);
	}

	deleteImage(id: number): Observable<boolean> {
		const dialogRef = this.dialog.open(DeleteImgConfirmDialogComponent);

		return dialogRef.afterClosed().pipe(
			switchMap(result => {
				if (result) {
					return this.http.delete(`/api/imagenes/${id}`).pipe(
						map(() => true),
						catchError(() => of(false))
					);
				} else {
					return of(false);
				}
			})
		);
	}

}
