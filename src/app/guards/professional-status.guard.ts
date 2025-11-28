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

      console.log('🔍 Professional Status:', data.status);
      console.log('📍 Current Path:', currentPath);

      // Si no es profesional, redirigir a upgrade
      if (!data.isProfessional) {
        if (currentPath !== 'professional/upgrade') {
          console.log('❌ No es profesional - redirigiendo a /professional/upgrade');
          router.navigate(['/professional/upgrade']);
          return false;
        }
        return true;
      }

      // Si ya está activo, permitir acceso solo a dashboard o complete
      if (data.status === 'active') {
        if (currentPath === 'professional/complete' || currentPath === 'professional/dashboard') {
          console.log('✅ Profesional activo - acceso permitido a', currentPath);
          return true;
        }
        console.log('✅ Profesional activo - redirigiendo a dashboard');
        router.navigate(['/professional/dashboard']);
        return false;
      }

      // Validar acceso según el estado actual
      const allowedPaths: { [key: string]: string[] } = {
        'pending': ['professional/upgrade', 'professional/documents'],
        'documents_uploaded': ['professional/documents', 'professional/plans'],
        'payment_completed': ['professional/categories']
      };

      const allowed = allowedPaths[data.status] || [];

      if (allowed.includes(currentPath)) {
        console.log(`✅ Estado ${data.status} - acceso permitido a ${currentPath}`);
        return true;
      }

      // Redirigir al paso correcto según el estado
      const redirectMap: { [key: string]: string } = {
        'pending': '/professional/documents',
        'documents_uploaded': '/professional/plans',
        'payment_completed': '/professional/categories'
      };

      const redirectTo = redirectMap[data.status] || '/professional/upgrade';
      console.log(`❌ Estado ${data.status} - redirigiendo a ${redirectTo}`);
      router.navigate([redirectTo]);
      return false;
    }),
    catchError(error => {
      console.log('❌ Error al verificar status profesional:', error);
      router.navigate(['/professional/upgrade']);
      return of(false);
    })
  );
};
