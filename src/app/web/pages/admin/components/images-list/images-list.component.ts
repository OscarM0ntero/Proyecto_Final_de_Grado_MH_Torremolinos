import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImagenesService } from '../../../../../services/imagenes.service';

@Component({
  selector: 'app-images-list',
  standalone: false,
  templateUrl: './images-list.component.html',
  styleUrl: './images-list.component.scss'
})
export class ImagesListComponent {
  page: string = '';

  images: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private imagenes: ImagenesService
  ) { }

  ngOnInit(): void {
    this.page = this.route.snapshot.data['page'];

    this.imagenes.loadImages(this.page).subscribe((imgs) => {
      this.images = imgs;
    });
  }

  deleteImage(id: number): void {
    this.imagenes.deleteImage(id).subscribe(deleted => {
      if (deleted) {
        this.imagenes.loadImages(this.page).subscribe(imgs => {
          this.images = imgs;
        });
      }
      else {
        console.log("gg");
      }
    });
  }

}
