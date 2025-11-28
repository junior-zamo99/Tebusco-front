import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  return authService.getMe().pipe(
    map(response => {
      console.log('✅ Sesión válida - acceso permitido');
      return true;
    }),
    catchError(error => {
      console.log('❌ Sesión inválida o expirada - redirigiendo a /auth-required');
      router.navigate(['/auth-required']);
      return of(false);
    })
  );
};3
