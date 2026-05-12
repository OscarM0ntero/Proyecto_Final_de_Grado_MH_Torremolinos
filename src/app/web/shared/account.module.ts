import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { ClientAccountComponent } from '../pages/client/components/client-account/client-account.component';

/**
 * Módulo compartido que declara ClientAccountComponent,
 * usado tanto en /admin/cuenta como en /cliente/cuenta.
 */
@NgModule({
    declarations: [ClientAccountComponent],
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        TranslateModule,
    ],
    exports: [ClientAccountComponent],
})
export class AccountModule { }
