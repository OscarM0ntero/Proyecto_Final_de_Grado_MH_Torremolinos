import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../../material/material.module';
import { AccountModule } from '../../shared/account.module';
import { ClientRoutingModule } from './client-routing.module';

import { ClientComponent } from './client.component';
import { ClientPanelLayoutComponent } from './components/client-panel-layout/client-panel-layout.component';
import { ClientBookingManagerComponent } from './components/client-booking-manager/client-booking-manager.component';

@NgModule({
    declarations: [
        ClientComponent,
        ClientPanelLayoutComponent,
        ClientBookingManagerComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        MatDialogModule,
        TranslateModule,
        AccountModule,
        ClientRoutingModule,
    ],
})
export class ClientModule { }
