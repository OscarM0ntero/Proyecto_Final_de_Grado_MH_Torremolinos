import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  contrasena = '';
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService,
    private snackBar: MatSnackBar

  ) { }

  login(): void {
    this.http.post<{ token: string }>('/api/login', {
      email: this.email,
      contrasena: this.contrasena
    }).subscribe({
      next: res => {
        localStorage.setItem('token', res.token);

        const rol = this.auth.getRol();
        if (rol === "administrador") {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/cliente']);
        }
      },
      error: () => {
        this.snackBar.open('Correo o contraseña incorrectos', undefined, {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }

    });
  }
}