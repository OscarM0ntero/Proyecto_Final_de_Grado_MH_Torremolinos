import { NgModule, PLATFORM_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { RecaptchaModule } from 'ng-recaptcha-2';
import localeEs from '@angular/common/locales/es';

import { MaterialModule } from '../material/material.module';
import { PrimeNgModule } from '../common/primeng.module';
import { WebRoutingModule } from './web-routing.module';
import { createTranslateLoader } from '../translate-loader';

// Páginas públicas
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { LocationComponent } from './pages/location/location.component';
import { BookingComponent } from './pages/booking/booking.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { Error404Component } from './pages/error404/error404.component';
import { ApartmentComponent } from './pages/apartment/apartment.component';
import { LegalComponent } from './pages/legal/legal.component';
import { GridOverlayComponent } from './pages/home/components/grid-overlay/grid-overlay.component';
import { DisponibilidadComponent } from './pages/booking/components/disponibilidad/disponibilidad.component';
import { RecoverPasswordComponent } from './pages/login/recover-password/recover-password.component';
import { LoginMenuComponent } from './pages/login/login-menu/login-menu.component';

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
        Error404Component,
        ApartmentComponent,
        LegalComponent,
        GridOverlayComponent,
        DisponibilidadComponent,
        RecoverPasswordComponent,
        LoginMenuComponent,
        // AdminModule y ClientModule se cargan lazy → no se declaran aquí
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
        MatDialogModule,
        RecaptchaModule,
        TranslateModule.forRoot({
            defaultLanguage: 'es',
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateLoader,
                deps: [HttpClient, PLATFORM_ID]
            }
        }),
        // CalendarModule eliminado del bundle principal → está en AdminModule (lazy)
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
    ]
})
export class WebModule { }
