import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from '../../../../../services/configuracion.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-admin-config-manager',
    standalone: false,
    templateUrl: './admin-config-manager.component.html',
    styleUrl: './admin-config-manager.component.scss'
})
export class AdminConfigManagerComponent implements OnInit {
    descuentoNoCancelable: number = 10;
    diasCancelacion: number = 30;
    guardando = false;

    constructor(
        private configuracionService: ConfiguracionService,
        private snackBar: MatSnackBar
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
    }

    guardar(): void {
        this.guardando = true;
        const saves = [
            this.configuracionService.setValor('descuento_no_cancelable', this.descuentoNoCancelable.toString()),
            this.configuracionService.setValor('dias_cancelacion', this.diasCancelacion.toString())
        ];

        let completados = 0;
        let hayError = false;

        saves.forEach(obs => obs.subscribe({
            next: () => {
                completados++;
                if (completados === saves.length) {
                    this.snackBar.open(hayError ? 'Error al guardar algún valor' : 'Configuración guardada', 'OK', { duration: 3000 });
                    this.guardando = false;
                }
            },
            error: () => {
                hayError = true;
                completados++;
                if (completados === saves.length) {
                    this.snackBar.open('Error al guardar', 'OK', { duration: 3000 });
                    this.guardando = false;
                }
            }
        }));
    }
}
