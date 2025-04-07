import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './pages/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
//import { GalleryComponent } from './pages/gallery/gallery.component';
//import { BookingComponent } from './pages/booking/booking.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent},
      { path: 'apartamento', component: HomeComponent},/*
      { path: 'reservar', component: BookingComponent},
      { path: 'galeria', component: GalleryComponent},
      { path: 'galeria/:id', component: GalleryComponent},*/
      { path: '**', redirectTo: ''}
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebRoutingModule { }
