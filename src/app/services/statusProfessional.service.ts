import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ProfessionalResponse } from '../models/professional-response.interface';

@Injectable({
  providedIn: 'root'
})
export class StatusProfessionalService {

  constructor(private router: Router) { }


  processRedirection(response: ProfessionalResponse): void {

    if (!response || !response.success || !response.data) {
      console.warn('Respuesta inválida en StatusProfessionalService');
      this.router.navigate(['/']); // Fallback a home
      return;
    }

    const { registrationStatus, usage } = response.data;
    const step = registrationStatus.currentStep;


    switch (step) {

      case 'documents':
         this.router.navigate(['/professional/documents']);

        break;

      case 'payment':
        this.router.navigate(['/professional/plans']);
        break;

      case 'categories':
        this.handleCategoriesRedirection(usage.categories);
        break;

      // 4. Todo listo
      case 'complete':
        this.router.navigate(['/professional/dashboard']);
        break;

      default:
        console.warn('Paso desconocido:', step);
        this.router.navigate(['/professional/dashboard']);
        break;
    }
  }


  private handleCategoriesRedirection(categoriesUsage: any): void {
    const isUnlimited = categoriesUsage.limit === 'Ilimitado';
    const available = typeof categoriesUsage.available === 'number' ? categoriesUsage.available : 999;

    if (!isUnlimited && available <= 0) {
      console.log('⚠️ Límite de categorías alcanzado. Redirigiendo a Dashboard con aviso.');

      // Lo mandamos al Dashboard, pero pasamos un "state" para mostrar el aviso
      this.router.navigate(['/professional/dashboard'], {
        state: {
          limitReached: true,
          message: 'Has completado todas tus categorías disponibles. Si deseas agregar más, puedes adquirir extras.'
        }
      });
    } else {
      console.log('✅ Aún tiene cupo para categorías viaja a configurar.');
      this.router.navigate(['/configure-category']); // O '/professional/categories'
    }
  }


  private handleDocumentsRedirection(status: any) {
      if(status.hasActiveSubscription) {
          // Si tiene subscripción pero le faltan docs (y puede saltar), probablemente va a categorías
          this.router.navigate(['/configure-category']);
      } else {
          // Si no tiene subscripción, va a planes
          this.router.navigate(['/professional/plans']);
      }
  }
}
