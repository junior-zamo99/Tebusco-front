import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// 1. Importamos los servicios necesarios
import { ProfessionalService } from '../../../services/professional.service';
import { StorageService } from '../../../services/storage.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-professional-category-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professional-category-success.component.html',
  styleUrl: './professional-category-success.component.css'
})
export class ProfessionalCategorySuccessComponent {

  // 2. Inyectamos los servicios
  constructor(
    private router: Router,
    private professionalService: ProfessionalService,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  onGoToDashboard() {
    this.professionalService.getMe().subscribe({
      next: (response) => {
        if (response.data.professional) {
          this.storageService.saveProfessional(response.data.professional);
          this.authService.updateProfessionalState(response.data.professional);
        }
        this.storageService.saveTypeOfUser({ keyType: 2 });
        localStorage.setItem('current_view', 'pl');
        this.router.navigate(['/professional/dashboard']);
      },
      error: (err) => {
        console.error('Error al sincronizar datos', err);
        this.router.navigate(['/professional/dashboard']);
      }
    });
  }

  onViewProfile() {
    localStorage.setItem('current_view', 'pl');
    this.router.navigate(['/professional/profile']);
  }
}
