import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  host: { ngSkipHydration: 'true' },      // Permite la funcion autoPlay del p-gallery funcionar bien
})
export class HomeComponent {
  images: any[] = [
    {
      itemImageSrc: 'assets/IMG_01.jpg',
      alt: 'Imagen 1',
      title: 'Foto 1'
    },
    {
      itemImageSrc: 'assets/IMG_05.jpg',
      alt: 'Imagen 2',
      title: 'Foto 2'
    },
    {
      itemImageSrc: 'assets/IMG_09.jpg',
      alt: 'Imagen 3',
      title: 'Foto 3'
    }
  ];
}