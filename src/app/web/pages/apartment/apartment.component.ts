import { Component } from '@angular/core';

@Component({
  selector: 'app-apartment',
  standalone: false,
  templateUrl: './apartment.component.html',
  styleUrl: './apartment.component.scss'
})
export class ApartmentComponent {
  images: any[] = [
    {
      itemImageSrc: 'assets/img/IMG_01.jpg',
      alt: 'Imagen 1',
      title: 'Foto 1'
    },
    {
      itemImageSrc: 'assets/img/IMG_19.jpg',
      alt: 'Imagen 2',
      title: 'Foto 2'
    },
    {
      itemImageSrc: 'assets/img/IMG_22.jpg',
      alt: 'Imagen 2',
      title: 'Foto 2'
    },
    {
      itemImageSrc: 'assets/img/IMG_29.jpg',
      alt: 'Imagen 2',
      title: 'Foto 2'
    },
    {
      itemImageSrc: 'assets/img/IMG_31.jpg',
      alt: 'Imagen 3',
      title: 'Foto 3'
    }
  ];
}
