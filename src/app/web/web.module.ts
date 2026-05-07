import { NgModule, PLATFORM_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { WebRoutingModule } from './web-routing.module';
import { MaterialModule } from '../material/material.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../common/primeng.module';
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
import { createTranslateLoader } from '../translate-loader';
import { DisponibilidadComponent } from './pages/booking/components/disponibilidad/disponibilidad.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import localeEs from '@angular/common/locales/es';
import { ClientComponent } from './pages/client/client.component';
import { AdminComponent } from './pages/admin/admin.component';
import { RecaptchaModule } from 'ng-recaptcha-2';
import { MatDialogModule } from '@angular/material/dialog';
import { ClientPanelLayoutComponent } from './pages/client/components/client-panel-layout/client-panel-layout.component';
import { ClientAccountComponent } from './pages/client/components/client-account/client-account.component';
import { AdminPanelLayoutComponent } from './pages/admin/components/admin-panel-layout/admin-panel-layout.component';
import { AdminImagesManagerComponent } from './pages/admin/components/admin-images-manager/admin-images-manager.component';
import { ImagesListComponent } from './pages/admin/components/images-list/images-list.component';
import { UploadImageComponent } from './pages/admin/components/upload-image/upload-image.component';
import { AdminContentManagerComponent } from './pages/admin/components/admin-content-manager/admin-content-manager.component';
import { ContentEditorComponent } from './pages/admin/components/content-editor/content-editor.component';
import { AdminBookingManagerComponent } from './pages/admin/components/admin-booking-manager/admin-booking-manager.component';
import { ClientBookingManagerComponent } from './pages/client/components/client-booking-manager/client-booking-manager.component';
import { AdminCalendarManagerComponent } from './pages/admin/components/admin-calendar-manager/admin-calendar-manager.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { AdminUsersManagerComponent } from './pages/admin/components/admin-users-manager/admin-users-manager.component';
import { AdminConfigManagerComponent } from './pages/admin/components/admin-config-manager/admin-config-manager.component';
import { EditUserDialogComponent } from './pages/admin/components/admin-users-manager/dialogs/edit-user-dialog/edit-user-dialog.component';
import { AddUserDialogComponent } from './pages/admin/components/admin-users-manager/dialogs/add-user-dialog/add-user-dialog.component';
import { RecoverPasswordComponent } from './pages/login/recover-password/recover-password.component';
import { LoginMenuComponent } from './pages/login/login-menu/login-menu.component';
import { LegalComponent } from './pages/legal/legal.component';

registerLocaleData(localeEs);

@NgModule({
	declarations: [
		HomeComponent,
		LayoutComponent,
		GalleryComponent,
		LocationComponent,
		BookingComponent,
		ContactComponent,
		LoginComponent,
		GridOverlayComponent,
		Error404Component,
		ApartmentComponent,
		DisponibilidadComponent,
		ClientComponent,
		AdminComponent,
		ClientPanelLayoutComponent,
		ClientAccountComponent,
		AdminPanelLayoutComponent,
		AdminImagesManagerComponent,
		ImagesListComponent,
		UploadImageComponent,
		AdminContentManagerComponent,
		ContentEditorComponent,
		AdminBookingManagerComponent,
		ClientBookingManagerComponent,
		AdminCalendarManagerComponent,
		AdminUsersManagerComponent,
		EditUserDialogComponent,
		AddUserDialogComponent,
		RecoverPasswordComponent,
		LoginMenuComponent,
		LegalComponent,
		AdminConfigManagerComponent,
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
				useFactory: createTranslateLoader,
				deps: [HttpClient, PLATFORM_ID]
			}
		}),
		RecaptchaModule,
		MatDialogModule,
		CalendarModule.forRoot({
			provide: DateAdapter,
			useFactory: adapterFactory
		}),
	],
	providers: [
		{ provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
	]
})
export class WebModule { }
