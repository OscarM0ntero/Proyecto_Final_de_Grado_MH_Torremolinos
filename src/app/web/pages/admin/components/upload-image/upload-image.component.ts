import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-upload-image',
  standalone: false,
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.scss'
})
export class UploadImageComponent {
  selectedFile: File | null = null;
  newAlt = 'alt';
  newOrden = 0;
  newPage = 'gallery';

  pages = [
    { value: 'home', label: 'Inicio' },
    { value: 'apartment', label: 'Apartamento' },
    { value: 'gallery', label: 'Galería' }
  ];


  constructor(private dialog: MatDialog, private http: HttpClient, private snackBar: MatSnackBar) { }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('imagen', this.selectedFile);
    formData.append('alt', this.newAlt);
    formData.append('orden', this.newOrden.toString());
    formData.append('pagina', this.newPage);

    this.http.post('/api/imagenes', formData).subscribe({
      next: () => {
        this.snackBar.open('Imagen subida correctamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.newAlt = '';
        this.newOrden = 0;
        this.selectedFile = null;
      },
      error: () => {
        this.snackBar.open('Error al subir la imagen', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

}
