import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminCalendarManagerComponent } from './components/admin-calendar-manager/admin-calendar-manager.component';
import { AdminBookingManagerComponent } from './components/admin-booking-manager/admin-booking-manager.component';
import { AdminUsersManagerComponent } from './components/admin-users-manager/admin-users-manager.component';
import { AdminConfigManagerComponent } from './components/admin-config-manager/admin-config-manager.component';
import { AdminResenasManagerComponent } from './components/admin-resenas-manager/admin-resenas-manager.component';
import { AdminContentManagerComponent } from './components/admin-content-manager/admin-content-manager.component';
import { ContentEditorComponent } from './components/content-editor/content-editor.component';
import { AdminImagesManagerComponent } from './components/admin-images-manager/admin-images-manager.component';
import { ImagesListComponent } from './components/images-list/images-list.component';
import { UploadImageComponent } from './components/upload-image/upload-image.component';
import { AccountComponent } from '../../shared/account/account.component';

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            { path: '', redirectTo: 'cuenta', pathMatch: 'full' },
            { path: 'cuenta', component: AccountComponent },
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
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule { }
