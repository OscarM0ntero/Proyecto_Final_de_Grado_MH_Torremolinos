// Página pública de gestión de una reserva mediante enlace mágico (/reserva/:token).
// No requiere cuenta: el token del email es la credencial.
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from '../../../services/loader.service';
import { ConfirmarCancelacionComponent } from './confirmar-cancelacion.component';

@Component({
	selector: 'app-reserva-token',
	standalone: false,
	templateUrl: './reserva-token.component.html',
	styleUrl: './reserva-token.component.scss'
})
export class ReservaTokenComponent implements OnInit {
	token = '';
	reserva: any = null;
	cargando = true;
	noEncontrada = false;
	cancelando = false;
	horaCheckin = '16:00';
	horaCheckout = '11:00';

	constructor(
		private route: ActivatedRoute,
		private http: HttpClient,
		private dialog: MatDialog,
		private snackBar: MatSnackBar,
		private translate: TranslateService,
		private loader: LoaderService
	) { }

	ngOnInit(): void {
		this.token = this.route.snapshot.paramMap.get('token') || '';
		this.cargar();

		this.http.get<any>('/api/configuracion/hora_checkin').subscribe({
			next: (c) => { this.horaCheckin = c.valor || '16:00'; }, error: () => { }
		});
		this.http.get<any>('/api/configuracion/hora_checkout').subscribe({
			next: (c) => { this.horaCheckout = c.valor || '11:00'; }, error: () => { }
		});
	}

	private cargar(): void {
		this.cargando = true;
		this.http.get(`/api/reservas/token/${this.token}`).subscribe({
			next: (r) => { this.reserva = r; this.cargando = false; },
			error: () => { this.noEncontrada = true; this.cargando = false; }
		});
	}

	get noches(): number {
		if (!this.reserva) return 0;
		const ini = new Date(this.reserva.fecha_inicio).getTime();
		const fin = new Date(this.reserva.fecha_fin).getTime();
		return Math.round((fin - ini) / 86400000);
	}

	get claseEstado(): string {
		return 'estado-' + (this.reserva?.estado_reserva || '').toLowerCase();
	}

	confirmarCancelacion(): void {
		const ref = this.dialog.open(ConfirmarCancelacionComponent, {
			data: {
				importe: this.reserva.importe_reembolsable,
				comision: this.reserva.comision_cancelacion,
				pct: this.reserva.comision_cancelacion_pct
			}
		});

		ref.afterClosed().subscribe(confirmado => {
			if (confirmado) this.cancelar();
		});
	}

	private cancelar(): void {
		this.cancelando = true;
		this.loader.mostrar();
		this.http.post(`/api/reservas/token/${this.token}/cancelar`, {}).subscribe({
			next: () => {
				this.loader.ocultar();
				this.cancelando = false;
				this.snackBar.open(
					this.translate.instant('MANAGE.CANCEL-OK'),
					undefined,
					{ duration: 6000, panelClass: ['snackbar-success'] }
				);
				this.cargar();
			},
			error: (err) => {
				this.loader.ocultar();
				this.cancelando = false;
				this.snackBar.open(
					err?.error?.error || this.translate.instant('MANAGE.CANCEL-ERROR'),
					undefined,
					{ duration: 8000, panelClass: ['snackbar-error'] }
				);
			}
		});
	}
}
