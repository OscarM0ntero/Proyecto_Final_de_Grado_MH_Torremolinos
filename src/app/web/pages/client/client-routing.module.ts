import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { ClientAccountComponent } from './components/client-account/client-account.component';
import { ClientBookingManagerComponent } from './components/client-booking-manager/client-booking-manager.component';

const routes: Routes = [
    {
        path: '',
        component: ClientComponent,
        children: [
            { path: '', redirectTo: 'cuenta', pathMatch: 'full' },
            { path: 'cuenta', component: ClientAccountComponent },
            { path: 'reservas', component: ClientBookingManagerComponent },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ClientRoutingModule { }
