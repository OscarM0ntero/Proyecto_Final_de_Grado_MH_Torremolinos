import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const ClientGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    auth.logout();
    router.navigate(['/iniciar-sesion']);
    return false;
  }

  if (auth.getRol() !== 'cliente') {
    router.navigate(['/iniciar-sesion']);
    return false;
  }

  return true;
};
