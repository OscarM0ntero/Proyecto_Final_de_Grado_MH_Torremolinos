import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private platformId = inject(PLATFORM_ID);
    private router = inject(Router);
    getToken(): string | null {
        if (!isPlatformBrowser(this.platformId)) return null;
        return localStorage.getItem('token');
    }

    isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) return true;

        try {
            const decoded: any = jwtDecode(token);
            const now = Math.floor(Date.now() / 1000);
            const expirado = decoded.exp < now;

            if (expirado && isPlatformBrowser(this.platformId)) {
                localStorage.removeItem('token');
            }

            return expirado;
        } catch {
            if (isPlatformBrowser(this.platformId)) {
                localStorage.removeItem('token');
            }
            return true;
        }
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        return !!token && !this.isTokenExpired();
    }

    getRol(): string | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const decoded: any = jwtDecode(token);
            return decoded.rol || null;
        } catch {
            return null;
        }
    }

    logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
            this.router.navigate(['/iniciar-sesion']);
        }
    }

}
