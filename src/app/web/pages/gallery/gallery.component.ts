import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-gallery',
  standalone: false,
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit {
  images: any[] = [];
  displayCustom = false;
  activeIndex = 0;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.http.get<any[]>('/api/imagenes?pagina=gallery').subscribe((res) => {
      this.images = res.map((img) => ({
        itemImageSrc: `/uploads/${img.url}`,
        itemThumbnailSrc: `/uploads/${img.url_thumbnail || img.url}`,
        alt: img.alt,
        title: img.alt
      }));
    });

  }

  imageClick(index: number) {
    if (isPlatformBrowser(this.platformId) && window.matchMedia('(min-width: 1024px)').matches) {
      this.activeIndex = index;
      this.displayCustom = true;
    }
  }
}
