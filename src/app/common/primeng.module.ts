import { NgModule } from '@angular/core';

import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { Carousel, CarouselModule } from 'primeng/carousel';
import { MenubarModule } from 'primeng/menubar';

@NgModule({
  imports: [
    Carousel
  ],
  exports: [
    GalleriaModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CardModule,
    CarouselModule,
    Carousel,
    MenubarModule
  ]
})
export class PrimeNgModule {}
