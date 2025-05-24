import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const PublicGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const rutaSolicitada = route.routeConfig?.path;

  if (rutaSolicitada === 'iniciar-sesion' && auth.isLoggedIn()) {
    const rol = auth.getRol();
    if (rol === 'administrador') {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/cliente']);
    }
    return false;
  }

  return true;
};
