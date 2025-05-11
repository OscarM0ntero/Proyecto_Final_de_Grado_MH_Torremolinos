import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { WebRoutingModule } from './web-routing.module';
import { MaterialModule } from '../material/material.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../common/primeng.module';
import { ImgTextComponent } from './pages/home/components/img-text/img-text.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { LocationComponent } from './pages/location/location.component';
import { BookingComponent } from './pages/booking/booking.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { GridOverlayComponent } from './pages/home/components/grid-overlay/grid-overlay.component';
import { Error404Component } from './pages/error404/error404.component';
import { ApartmentComponent } from './pages/apartment/apartment.component';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '../../environments/environment';

// Función de carga de traducciones compatible con SSR
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, environment.webUrl + 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    HomeComponent,
    LayoutComponent,
    ImgTextComponent,
    GalleryComponent,
    LocationComponent,
    BookingComponent,
    ContactComponent,
    LoginComponent,
    GridOverlayComponent,
    Error404Component,
    ApartmentComponent,
  ],
  imports: [
    CommonModule,
    WebRoutingModule,
    MaterialModule,
    MatTooltipModule,
    MatSlideToggleModule,
    FormsModule,
    PrimeNgModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'es',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]
})
export class WebModule { }
