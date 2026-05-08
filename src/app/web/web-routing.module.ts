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
import { AdminImagesManagerComponent } from './pages/admin/components/admin-images-manager/admin-images-manager.component';
import { ImagesListComponent } from './pages/admin/components/images-list/images-list.component';
import { UploadImageComponent } from './pages/admin/components/upload-image/upload-image.component';
import { AdminContentManagerComponent } from './pages/admin/components/admin-content-manager/admin-content-manager.component';
import { ContentEditorComponent } from './pages/admin/components/content-editor/content-editor.component';
import { AdminBookingManagerComponent } from './pages/admin/components/admin-booking-manager/admin-booking-manager.component';
import { ClientBookingManagerComponent } from './pages/client/components/client-booking-manager/client-booking-manager.component';
import { AdminCalendarManagerComponent } from './pages/admin/components/admin-calendar-manager/admin-calendar-manager.component';
import { AdminUsersManagerComponent } from './pages/admin/components/admin-users-manager/admin-users-manager.component';
import { AdminConfigManagerComponent } from './pages/admin/components/admin-config-manager/admin-config-manager.component';
import { AdminResenasManagerComponent } from './pages/admin/components/admin-resenas-manager/admin-resenas-manager.component';
import { RecoverPasswordComponent } from './pages/login/recover-password/recover-password.component';
import { LoginMenuComponent } from './pages/login/login-menu/login-menu.component';
import { LegalComponent } from './pages/legal/legal.component';

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
				component: ClientComponent,
				canActivate: [ClientGuard],
				children: [
					{ path: '', redirectTo: 'cuenta', pathMatch: 'full' },
					{ path: 'cuenta', component: ClientAccountComponent },
					{ path: 'reservas', component: ClientBookingManagerComponent },
				]
			},
			{
				path: 'admin',
				component: AdminComponent,
				canActivate: [AdminGuard],
				children: [
					{ path: '', redirectTo: 'cuenta', pathMatch: 'full' },
					{ path: 'cuenta', component: ClientAccountComponent },
					{ path: 'calendario', component: AdminCalendarManagerComponent },
					{ path: 'reservas', component: AdminBookingManagerComponent },
					{ path: 'usuarios', component: AdminUsersManagerComponent },
					{ path: 'configuracion', component: AdminConfigManagerComponent },
					{ path: 'resenas', component: AdminResenasManagerComponent },
					{
						path: 'textos',
						component: AdminContentManagerComponent,
						children: [
							{ path: '', redirectTo: 'inicio', pathMatch: 'full' },
							{ path: 'inicio', component: ContentEditorComponent, data: { page: 'home' } },
							{ path: 'apartamento', component: ContentEditorComponent, data: { page: 'apartment' } },
							{ path: 'localizacion', component: ContentEditorComponent, data: { page: 'location' } },
							{ path: 'contacto', component: ContentEditorComponent, data: { page: 'contact' } },
							{ path: 'legal', component: ContentEditorComponent, data: { page: 'legal' } },
						]
					},
					{
						path: 'imagenes',
						component: AdminImagesManagerComponent,
						children: [
							{ path: '', redirectTo: 'subir-imagen', pathMatch: 'full' },
							{ path: 'subir-imagen', component: UploadImageComponent },
							{ path: 'inicio', component: ImagesListComponent, data: { page: 'home' } },
							{ path: 'apartamento', component: ImagesListComponent, data: { page: 'apartment' } },
							{ path: 'galeria', component: ImagesListComponent, data: { page: 'gallery' } },
						]
					},

				]
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
