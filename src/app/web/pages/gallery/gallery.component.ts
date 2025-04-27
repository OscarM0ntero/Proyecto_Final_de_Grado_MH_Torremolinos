import { Component } from '@angular/core';

@Component({
  selector: 'app-gallery',
  standalone: false,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  images: any[] = [
    { itemImageSrc: 'assets/IMG_01.jpg', alt: 'Imagen 1', title: 'Foto 1' },
    { itemImageSrc: 'assets/IMG_05.jpg', alt: 'Imagen 2', title: 'Foto 2' },
    { itemImageSrc: 'assets/IMG_01.jpg', alt: 'Imagen 3', title: 'Foto 3' },
    { itemImageSrc: 'assets/IMG_05.jpg', alt: 'Imagen 4', title: 'Foto 4' },
    { itemImageSrc: 'assets/IMG_01.jpg', alt: 'Imagen 5', title: 'Foto 5' },
    { itemImageSrc: 'assets/IMG_05.jpg', alt: 'Imagen 6', title: 'Foto 6' },
    { itemImageSrc: 'assets/IMG_01.jpg', alt: 'Imagen 7', title: 'Foto 7' },
    { itemImageSrc: 'assets/IMG_01.jpg', alt: 'Imagen 8', title: 'Foto 8' },
    { itemImageSrc: 'assets/IMG_05.jpg', alt: 'Imagen 9', title: 'Foto 9' },
    { itemImageSrc: 'assets/IMG_01.jpg', alt: 'Imagen 10', title: 'Foto 10' },
    { itemImageSrc: 'assets/IMG_05.jpg', alt: 'Imagen 11', title: 'Foto 11' },
    { itemImageSrc: 'assets/IMG_01.jpg', alt: 'Imagen 12', title: 'Foto 12' },
    { itemImageSrc: 'assets/IMG_05.jpg', alt: 'Imagen 13', title: 'Foto 13' },
    { itemImageSrc: 'assets/IMG_01.jpg', alt: 'Imagen 14', title: 'Foto 14' },
    { itemImageSrc: 'assets/IMG_01.jpg', alt: 'Imagen 15', title: 'Foto 15' }
  ];

  displayCustom: boolean = false;
  activeIndex: number = 0;

  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  imageClick(index: number) {
    this.activeIndex = index;
    this.displayCustom = true;
    console.log("ey");
  }
}