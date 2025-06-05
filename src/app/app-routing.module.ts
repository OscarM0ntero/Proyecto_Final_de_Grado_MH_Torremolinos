import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		loadChildren: () => import('./web/web.module').then(m => m.WebModule) // Cargamos el web module que gestiona todas las rutas de la web
	},
	{
		path: '**',
		redirectTo: ''
	}
];

@NgModule({
	imports: [
		// Importamos estas opciones de scroll para poder enviar a una seccion de la web scrolleando
		RouterModule.forRoot(routes, {
			anchorScrolling: 'enabled',
			scrollPositionRestoration: 'enabled'
		})
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
