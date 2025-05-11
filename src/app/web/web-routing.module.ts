import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { BookingComponent } from './pages/booking/booking.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LocationComponent } from './pages/location/location.component';
import { LoginComponent } from './pages/login/login.component';
import { Error404Component } from './pages/error404/error404.component';
import { ApartmentComponent } from './pages/apartment/apartment.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent},
      { path: 'apartamento', component: ApartmentComponent},
      { path: 'galeria', component: GalleryComponent},
      { path: 'localizacion', component: LocationComponent},
      { path: 'reservar', component: BookingComponent},
      { path: 'contacto', component: ContactComponent},
      { path: 'iniciar-sesion', component: LoginComponent},
      { path: '**', component: Error404Component}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebRoutingModule { }
