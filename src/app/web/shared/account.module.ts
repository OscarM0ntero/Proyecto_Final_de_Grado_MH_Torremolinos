import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MaterialModule } from '../../material/material.module';
import { AccountComponent } from './account/account.component';

/**
 * Módulo compartido que declara AccountComponent,
 * usado tanto en /admin/cuenta como en /cliente/cuenta.
 */
@NgModule({
    declarations: [AccountComponent],
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        TranslatePipe,
    ],
    exports: [AccountComponent],
})
export class AccountModule { }
