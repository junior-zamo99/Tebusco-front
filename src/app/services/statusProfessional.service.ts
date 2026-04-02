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
      this.router.navigate(['/']);
      return;
    }

    const step = response.data.registrationStatus.currentStep;

    switch (step) {
      case 'categories':
        this.router.navigate(['/professional/categories']);
        break;

      case 'payment':
        this.router.navigate(['/professional/dashboard']);
        break;

      case 'complete':
        this.router.navigate(['/professional/dashboard']);
        break;

      default:
        console.warn('Paso desconocido:', step);
        this.router.navigate(['/professional/dashboard']);
        break;
    }
  }
}
