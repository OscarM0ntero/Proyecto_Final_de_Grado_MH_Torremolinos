import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DisponibilidadService } from '../../../../../services/disponibilidad.service';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { RecaptchaComponent } from 'ng-recaptcha-2';
import { LoaderService } from '../../../../../services/loader.service';
import { ReservaConfirmadaComponent } from './dialogs/reserva-confirmada.component';
import { ReservaRequiereLoginComponent } from './dialogs/reserva-requiere-login.component';
import { environment } from '../../../../../../environments/environment';
import { LayoutComponent } from '../../../layout/layout.component';
import { PREFIJOS_TELEFONO } from '../../../../../shared/prefijos';

@Component({
  selector: 'app-disponibilidad',
  standalone: false,
  templateUrl: './disponibilidad.component.html',
  styleUrls: ['./disponibilidad.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DisponibilidadComponent implements OnInit {
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;
  tokenCaptcha: string = '';
  siteKey = environment.recaptchaSiteKey;

  disponibilidad: { fecha: string; precio: number; estado: string }[] = [];

  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  precioMascota = 0;
  precioTotal = 0;
  numeroNoches = 0;
  mostrarResumen = false;
  camposBloqueados = false;

  reserva: any = {
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    huespedes: 4,
    conBebe: false,
    conMascota: false,
    nota: ''
  };

  prefijos = PREFIJOS_TELEFONO;

  dias: any = [];
  precioPorNoche = 0;

  constructor(
    private disponibilidadService: DisponibilidadService,
    private http: HttpClient,
    private dialog: MatDialog,
    private loader: LoaderService,
    public layout: LayoutComponent
  ) { }

  ngOnInit(): void {
    this.disponibilidadService.getDisponibilidad().subscribe(data => {
      this.disponibilidad = data.map(d => ({
        ...d,
        fecha: d.fecha.trim(),
        precio: Number(d.precio)
      }));
    });

    const token = localStorage.getItem('token');
    if (token) {
      this.http.get('/api/usuarios/me').subscribe({
        next: (usuario: any) => {
          this.reserva.nombre = usuario.nombre;
          this.reserva.apellidos = usuario.apellidos;
          this.reserva.email = usuario.email;
          this.reserva.prefijo = usuario.prefijo;
          this.reserva.telefono = usuario.telefono;
          this.camposBloqueados = true;
        },
        error: () => {
          localStorage.removeItem('token');
          this.camposBloqueados = false;
        }
      });
    }

    this.layout.captchaResuelto$.subscribe(token => {
      this.tokenCaptcha = token;
      this.enviarReserva();
    });
  }

  verDialog1(): void {
    this.dialog.open(ReservaConfirmadaComponent);
  }
  verDialog2(): void {
    this.dialog.open(ReservaRequiereLoginComponent);
  }

  verificarCaptcha(): void {
    this.layout.captchaRef?.execute();
  }

  resetCaptcha(): void {
    try {
      this.layout.captchaRef?.reset();
    } catch (e) {
      console.warn('No se pudo reiniciar reCAPTCHA:', e);
    }
  }

  onRangoModelChanged(): void {
    if (this.fechaInicio && this.fechaFin) this.onRangoChange();
  }

  onRangoChange(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      this.precioTotal = 0;
      return;
    }

    const inicio = this.formatearFechaLocal(this.fechaInicio);
    const fin = this.formatearFechaLocal(this.fechaFin);
    const diasEsperados = Math.ceil((new Date(fin).getTime() - new Date(inicio).getTime()) / (1000 * 60 * 60 * 24));
    const fechas = this.disponibilidad.filter(d => d.estado === 'disponible' && d.fecha >= inicio && d.fecha < fin);

    this.numeroNoches = diasEsperados;
    this.precioTotal = fechas.length === diasEsperados
      ? fechas.reduce((total, d) => total + d.precio, 0)
      : 0;

    this.dias = fechas;
    this.calcPrecioMascotas();
    this.precioTotal += this.precioMascota;
    this.precioPorNoche = this.precioTotal / this.numeroNoches;
  }

  formatearFechaLocal(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const d = fecha.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  calcPrecioMascotas(): void {
    this.precioMascota = this.reserva.conMascota ? this.numeroNoches * 10 : 0;
  }

  enviarReserva(): void {
    if (!this.fechaInicio || !this.fechaFin || !this.layout.tokenCaptcha) return;

    const payload = {
      ...this.reserva,
      fechaInicio: this.formatearFechaLocal(this.fechaInicio),
      fechaFin: this.formatearFechaLocal(this.fechaFin),
      numeroNoches: this.numeroNoches,
      precio_total: this.precioTotal,
      recaptcha: this.layout.tokenCaptcha // 👈 capturado desde Layout
    };

    this.loader.mostrar();

    this.http.post('/api/reservas', payload).subscribe({
      next: () => {
        this.dialog.open(ReservaConfirmadaComponent);
        this.mostrarResumen = false;
        this.layout.tokenCaptcha = '';      // 🔁 limpia token
        this.loader.ocultar();
        this.layout.resetCaptcha();         // 🔁 reinicia captcha desde layout
      },
      error: err => {
        this.loader.ocultar();
        this.layout.resetCaptcha();         // 🔁 también en error

        if (err.status === 409 && err.error?.requiereLogin) {
          this.dialog.open(ReservaRequiereLoginComponent);
        } else {
          alert('Error al enviar la reserva');
        }
      }
    });
  }

  dateClass: MatCalendarCellClassFunction<Date> = (date: Date) => {
    const fechaStr = this.formatearFechaLocal(date);
    const dia = this.disponibilidad.find(d => d.fecha === fechaStr);
    return dia?.estado ? `dia-${dia.estado}` : '';
  };

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    const fechaStr = this.formatearFechaLocal(date);
    const dia = this.disponibilidad.find(d => d.fecha === fechaStr);
    if (dia?.estado === 'disponible') return true;

    const anterior = new Date(date);
    anterior.setDate(anterior.getDate() - 1);
    const anteriorStr = this.formatearFechaLocal(anterior);
    const diaAntes = this.disponibilidad.find(d => d.fecha === anteriorStr);

    return diaAntes?.estado === 'disponible';
  };
}
