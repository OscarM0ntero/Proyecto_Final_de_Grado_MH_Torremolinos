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
import { LegalComponent } from './pages/legal/legal.component';
import { RecoverPasswordComponent } from './pages/login/recover-password/recover-password.component';
import { LoginMenuComponent } from './pages/login/login-menu/login-menu.component';

import { PublicGuard } from '../guards/public.guard';
import { AdminGuard } from '../guards/admin.guard';
import { ClientGuard } from '../guards/client.guard';

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
            { path: 'legal', component: LegalComponent, canActivate: [PublicGuard] },
            {
                path: 'iniciar-sesion',
                component: LoginComponent,
                canActivate: [PublicGuard],
                children: [
                    { path: '', component: LoginMenuComponent },
                    { path: 'recover', component: RecoverPasswordComponent },
                ]
            },
            {
                path: 'cliente',
                canActivate: [ClientGuard],
                loadChildren: () => import('./pages/client/client.module').then(m => m.ClientModule),
            },
            {
                path: 'admin',
                canActivate: [AdminGuard],
                loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
            },
            { path: '**', component: Error404Component }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
})
export class WebRoutingModule { }
