import { Component } from '@angular/core';

@Component({
  selector: 'app-gallery',
  standalone: false,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  images: any[] = [
    { itemImageSrc: 'assets/img/IMG_01.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_01t.jpg', alt: 'Imagen 1', title: 'Foto 1' },
    { itemImageSrc: 'assets/img/IMG_02.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_02t.jpg', alt: 'Imagen 2', title: 'Foto 2' },
    { itemImageSrc: 'assets/img/IMG_03.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_03t.jpg', alt: 'Imagen 3', title: 'Foto 3' },
    { itemImageSrc: 'assets/img/IMG_04.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_04t.jpg', alt: 'Imagen 4', title: 'Foto 4' },
    { itemImageSrc: 'assets/img/IMG_05.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_05t.jpg', alt: 'Imagen 5', title: 'Foto 5' },
    { itemImageSrc: 'assets/img/IMG_06.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_06t.jpg', alt: 'Imagen 6', title: 'Foto 6' },
    { itemImageSrc: 'assets/img/IMG_07.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_07t.jpg', alt: 'Imagen 7', title: 'Foto 7' },
    { itemImageSrc: 'assets/img/IMG_08.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_08t.jpg', alt: 'Imagen 8', title: 'Foto 8' },
    { itemImageSrc: 'assets/img/IMG_09.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_09t.jpg', alt: 'Imagen 9', title: 'Foto 9' },
    { itemImageSrc: 'assets/img/IMG_10.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_10t.jpg', alt: 'Imagen 10', title: 'Foto 10' },
    { itemImageSrc: 'assets/img/IMG_11.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_11t.jpg', alt: 'Imagen 11', title: 'Foto 11' },
    { itemImageSrc: 'assets/img/IMG_12.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_12t.jpg', alt: 'Imagen 12', title: 'Foto 12' },
    { itemImageSrc: 'assets/img/IMG_13.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_13t.jpg', alt: 'Imagen 13', title: 'Foto 13' },
    { itemImageSrc: 'assets/img/IMG_14.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_14t.jpg', alt: 'Imagen 14', title: 'Foto 14' },
    { itemImageSrc: 'assets/img/IMG_15.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_15t.jpg', alt: 'Imagen 15', title: 'Foto 15' },
    { itemImageSrc: 'assets/img/IMG_16.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_16t.jpg', alt: 'Imagen 16', title: 'Foto 16' },
    { itemImageSrc: 'assets/img/IMG_17.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_17t.jpg', alt: 'Imagen 17', title: 'Foto 17' },
    { itemImageSrc: 'assets/img/IMG_18.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_18t.jpg', alt: 'Imagen 18', title: 'Foto 18' },
    { itemImageSrc: 'assets/img/IMG_19.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_19t.jpg', alt: 'Imagen 19', title: 'Foto 19' },
    { itemImageSrc: 'assets/img/IMG_20.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_20t.jpg', alt: 'Imagen 20', title: 'Foto 20' },
    { itemImageSrc: 'assets/img/IMG_21.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_21t.jpg', alt: 'Imagen 21', title: 'Foto 21' },
    { itemImageSrc: 'assets/img/IMG_22.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_22t.jpg', alt: 'Imagen 22', title: 'Foto 22' },
    { itemImageSrc: 'assets/img/IMG_23.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_23t.jpg', alt: 'Imagen 23', title: 'Foto 23' },
    { itemImageSrc: 'assets/img/IMG_24.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_24t.jpg', alt: 'Imagen 24', title: 'Foto 24' },
    { itemImageSrc: 'assets/img/IMG_25.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_25t.jpg', alt: 'Imagen 25', title: 'Foto 25' },
    { itemImageSrc: 'assets/img/IMG_26.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_26t.jpg', alt: 'Imagen 26', title: 'Foto 26' },
    //{ itemImageSrc: 'assets/img/IMG_27.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_27t.jpg', alt: 'Imagen 27', title: 'Foto 27' },
    { itemImageSrc: 'assets/img/IMG_28.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_28t.jpg', alt: 'Imagen 28', title: 'Foto 28' },
    { itemImageSrc: 'assets/img/IMG_29.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_29t.jpg', alt: 'Imagen 29', title: 'Foto 29' },
    { itemImageSrc: 'assets/img/IMG_31.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_31t.jpg', alt: 'Imagen 31', title: 'Foto 31' },
    { itemImageSrc: 'assets/img/IMG_32.jpg', itemThumbnailSrc: 'assets/thumbnail/IMG_32t.jpg', alt: 'Imagen 32', title: 'Foto 32' },

  ];

  displayCustom: boolean = false;
  activeIndex: number = 0;

  imageClick(index: number) {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      this.activeIndex = index;
      this.displayCustom = true;
    }
  }

}