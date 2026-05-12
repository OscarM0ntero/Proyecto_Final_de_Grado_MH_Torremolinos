import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { MaterialModule } from '../../../material/material.module';
import { AccountModule } from '../../shared/account.module';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminComponent } from './admin.component';
import { AdminPanelLayoutComponent } from './components/admin-panel-layout/admin-panel-layout.component';
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
import { EditUserDialogComponent } from './components/admin-users-manager/dialogs/edit-user-dialog/edit-user-dialog.component';
import { AddUserDialogComponent } from './components/admin-users-manager/dialogs/add-user-dialog/add-user-dialog.component';

@NgModule({
    declarations: [
        AdminComponent,
        AdminPanelLayoutComponent,
        AdminCalendarManagerComponent,
        AdminBookingManagerComponent,
        AdminUsersManagerComponent,
        AdminConfigManagerComponent,
        AdminResenasManagerComponent,
        AdminContentManagerComponent,
        ContentEditorComponent,
        AdminImagesManagerComponent,
        ImagesListComponent,
        UploadImageComponent,
        EditUserDialogComponent,
        AddUserDialogComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatDialogModule,
        TranslateModule,
        AccountModule,
        AdminRoutingModule,
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory,
        }),
    ],
})
export class AdminModule { }
