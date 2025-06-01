import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Reserva, ReservasService } from '../../../../../services/reservas.service';

@Component({
  selector: 'app-client-booking-manager',
  standalone: false,
  templateUrl: './client-booking-manager.component.html',
  styleUrl: './client-booking-manager.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ClientBookingManagerComponent implements OnInit {
  reservas: Reserva[] = [];

  constructor(private reservasService: ReservasService) { }

  ngOnInit(): void {
    this.reservasService.getReservasCliente().subscribe(res => {
      this.reservas = res;
    });
  }
}
