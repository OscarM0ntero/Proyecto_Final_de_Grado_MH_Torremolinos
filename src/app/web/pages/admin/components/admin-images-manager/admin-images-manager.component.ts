import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmDialogComponent } from '../dialogs/delete-confirm-dialog.component';

@Component({
  selector: 'app-admin-images-manager',
  standalone: false,
  templateUrl: './admin-images-manager.component.html',
  styleUrl: './admin-images-manager.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AdminImagesManagerComponent implements OnInit {
  images: any[] = [];
  selectedFile: File | null = null;
  newAlt = '';
  newOrden = 0;
  newPage = '';

  constructor(private dialog: MatDialog, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.http.get<any[]>('/api/imagenes?pagina=gallery').subscribe(res => {
      this.images = res;
    });
  }

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

    this.http.post('/api/imagenes', formData).subscribe(() => {
      this.newAlt = '';
      this.newOrden = 0;
      this.selectedFile = null;
      this.loadImages();
    });
  }

  deleteImage(id: number): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.delete(`/api/imagenes/${id}`).subscribe(() => {
          this.loadImages();
        });
      }
    });
  }

}

