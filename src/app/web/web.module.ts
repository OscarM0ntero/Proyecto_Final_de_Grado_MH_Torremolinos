import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
//import { BookingComponent } from './pages/booking/booking.component';
import { LayoutComponent } from './pages/layout/layout.component';
//import { GalleryComponent } from './pages/gallery/gallery.component';
import { WebRoutingModule } from './web-routing.module';
import { MaterialModule } from '../material/material.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { ImgVerticalComponent } from './pages/home/components/img-vertical/img-vertical.component';
import { ImgHorizontalComponent } from './pages/home/components/img-horizontal/img-horizontal.component';



@NgModule({
  declarations: [
    HomeComponent,
    //BookingComponent,
    LayoutComponent,
    ImgVerticalComponent,
    ImgHorizontalComponent,
    //GalleryComponent
  ],
  imports: [
    CommonModule,
    WebRoutingModule,
    MaterialModule,
    MatTooltipModule,
    MatSlideToggleModule,
    FormsModule
  ]
})
export class WebModule { }
