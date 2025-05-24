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

import { PublicGuard } from '../guards/public.guard';
import { AdminGuard } from '../guards/admin.guard';
import { ClientGuard } from '../guards/client.guard';
import { ClientComponent } from './pages/client/client.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ClientAccountComponent } from './pages/client/components/client-account/client-account.component';
import { ClientBookingsComponent } from './pages/client/components/client-bookings/client-bookings.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [PublicGuard],
    children: [
      { path: '', component: HomeComponent, canActivate: [PublicGuard] },
      { path: 'apartamento', component: ApartmentComponent, canActivate: [PublicGuard] },
      { path: 'galeria', component: GalleryComponent, canActivate: [PublicGuard] },
      { path: 'localizacion', component: LocationComponent, canActivate: [PublicGuard] },
      { path: 'contacto', component: ContactComponent, canActivate: [PublicGuard] },
      { path: 'reservar', component: BookingComponent, canActivate: [PublicGuard] },
      { path: 'iniciar-sesion', component: LoginComponent, canActivate: [PublicGuard] },
      {
        path: 'cliente',
        component: ClientComponent,
        canActivate: [ClientGuard],
        children: [
          { path: '', redirectTo: 'cuenta', pathMatch: 'full' },
          { path: 'cuenta', component: ClientAccountComponent },
          { path: 'reservas', component: ClientBookingsComponent },
        ]
      },
      { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
      { path: '**', component: Error404Component }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebRoutingModule { }
