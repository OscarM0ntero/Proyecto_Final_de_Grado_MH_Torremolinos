import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from '../../../../../services/configuracion.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-admin-config-manager',
    standalone: false,
    templateUrl: './admin-config-manager.component.html',
    styleUrl: './admin-config-manager.component.scss'
})
export class AdminConfigManagerComponent implements OnInit {
    descuentoNoCancelable: number = 10;
    diasCancelacion: number = 30;
    precioBase: number = 150;
    precioMascota: number = 10;
    minNoches: number = 1;
    horaCheckin: string = '16:00';
    horaCheckout: string = '11:00';
    guardando = false;

    constructor(
        private configuracionService: ConfiguracionService,
        private snackBar: MatSnackBar,
        private translate: TranslateService
    ) { }

    ngOnInit(): void {
        this.configuracionService.getValor('descuento_no_cancelable').subscribe({
            next: (cfg) => { this.descuentoNoCancelable = parseFloat(cfg.valor) || 10; },
            error: () => { this.descuentoNoCancelable = 10; }
        });
        this.configuracionService.getValor('dias_cancelacion').subscribe({
            next: (cfg) => { this.diasCancelacion = parseInt(cfg.valor) || 30; },
            error: () => { this.diasCancelacion = 30; }
        });
        this.configuracionService.getValor('precio_base').subscribe({
            next: (cfg) => { this.precioBase = parseFloat(cfg.valor) || 150; },
            error: () => { this.precioBase = 150; }
        });
        this.configuracionService.getValor('precio_mascota').subscribe({
            next: (cfg) => { this.precioMascota = parseFloat(cfg.valor) || 10; },
            error: () => { this.precioMascota = 10; }
        });
        this.configuracionService.getValor('min_noches').subscribe({
            next: (cfg) => { this.minNoches = parseInt(cfg.valor) || 1; },
            error: () => { this.minNoches = 1; }
        });
        this.configuracionService.getValor('hora_checkin').subscribe({
            next: (cfg) => { this.horaCheckin = cfg.valor || '16:00'; },
            error: () => { this.horaCheckin = '16:00'; }
        });
        this.configuracionService.getValor('hora_checkout').subscribe({
            next: (cfg) => { this.horaCheckout = cfg.valor || '11:00'; },
            error: () => { this.horaCheckout = '11:00'; }
        });
    }

    guardar(): void {
        this.guardando = true;
        const saves = [
            this.configuracionService.setValor('descuento_no_cancelable', this.descuentoNoCancelable.toString()),
            this.configuracionService.setValor('dias_cancelacion', this.diasCancelacion.toString()),
            this.configuracionService.setValor('precio_base', this.precioBase.toString()),
            this.configuracionService.setValor('precio_mascota', this.precioMascota.toString()),
            this.configuracionService.setValor('min_noches', this.minNoches.toString()),
            this.configuracionService.setValor('hora_checkin', this.horaCheckin),
            this.configuracionService.setValor('hora_checkout', this.horaCheckout)
        ];

        let completados = 0;
        let hayError = false;

        saves.forEach(obs => obs.subscribe({
            next: () => {
                completados++;
                if (completados === saves.length) {
                    this.snackBar.open(
                        this.translate.instant(hayError ? 'SNACKBAR.CHANGES-ERROR' : 'SNACKBAR.CHANGES-APPLIED'),
                        undefined,
                        { duration: 3000, panelClass: [hayError ? 'snackbar-error' : 'snackbar-success'] }
                    );
                    this.guardando = false;
                }
            },
            error: () => {
                hayError = true;
                completados++;
                if (completados === saves.length) {
                    this.snackBar.open(
                        this.translate.instant('SNACKBAR.CHANGES-ERROR'),
                        undefined,
                        { duration: 3000, panelClass: ['snackbar-error'] }
                    );
                    this.guardando = false;
                }
            }
        }));
    }
}
