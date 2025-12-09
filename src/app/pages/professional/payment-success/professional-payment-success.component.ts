import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfessionalService } from '../../../services/professional.service';
import { StorageService } from '../../../services/storage.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-professional-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professional-payment-success.component.html',
  styleUrl: './professional-payment-success.component.css'
})
export class ProfessionalPaymentSuccessComponent {

  private professionalData: any = null;

  constructor(
    private router: Router,
    private professionalService: ProfessionalService,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  onContinue() {

    this.router.navigate(['/professional/categories']);
  }

 onDashboard() {
    this.professionalService.getMe().subscribe({
      next: (response) => {
        this.professionalData = response.data;
        if (response.data.professional) {
          this.storageService.saveProfessional(response.data.professional);

          this.authService.updateProfessionalState(response.data.professional);
        }

        this.storageService.saveTypeOfUser({ keyType: 2 });
        localStorage.setItem('current_view', 'pl');

        console.log('✅ Upgrade exitoso. Redirigiendo al dashboard...');

        this.router.navigate(['/professional/dashboard']);
      },
      error: (err) => {
        console.error('Error obteniendo datos del profesional', err);
        this.router.navigate(['/professional/dashboard']);
      }
    });
  }
}


