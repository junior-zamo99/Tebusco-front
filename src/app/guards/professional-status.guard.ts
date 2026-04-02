import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { ProfessionalService } from '../services/professional.service';
import { map, catchError, of } from 'rxjs';

export const professionalStatusGuard = (route: ActivatedRouteSnapshot) => {
  const professionalService = inject(ProfessionalService);
  const router = inject(Router);

  return professionalService.getProfessionalStatus().pipe(
    map(response => {
      const data = response.data;
      const currentPath = route.routeConfig?.path || '';
      const step = data.currentStep;

      // No es profesional → upgrade
      if (!data.isProfessional) {
        if (currentPath !== 'professional/upgrade') {
          router.navigate(['/professional/upgrade']);
          return false;
        }
        return true;
      }

      // Categorías configuradas (con o sin suscripción) → solo puede ir al dashboard
      if (step === 'complete' || step === 'payment' || data.status === 'active') {
        if (currentPath === 'professional/dashboard' || currentPath === 'professional/complete') {
          return true;
        }
        router.navigate(['/professional/dashboard']);
        return false;
      }

      // Paths permitidos según el paso actual
      const allowedPaths: Record<string, string[]> = {
        'categories': ['professional/categories'],
      };

      const redirectMap: Record<string, string> = {
        'categories': '/professional/categories',
      };

      const allowed = allowedPaths[step] || [];

      if (allowed.includes(currentPath)) {
        return true;
      }

      const redirectTo = redirectMap[step] || '/professional/upgrade';
      router.navigate([redirectTo]);
      return false;
    }),
    catchError(() => {
      router.navigate(['/professional/upgrade']);
      return of(false);
    })
  );
};
