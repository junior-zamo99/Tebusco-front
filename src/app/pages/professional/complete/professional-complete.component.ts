import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfessionalService } from '../../../services/professional.service';
import { StorageService } from '../../../services/storage.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-professional-complete',
  standalone: true,
  imports: [],
  templateUrl: './professional-complete.component.html',
  styleUrl: './professional-complete.component.css'
})
export class ProfessionalCompleteComponent implements OnInit {
  showConfetti = false;

  constructor(
    private router: Router,
    private professionalService: ProfessionalService,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.showConfetti = true;
  }

  goToDashboard() {
    this.professionalService.getMe().subscribe({
      next: (response) => {
        if (response.data?.professional) {
          this.storageService.saveProfessional(response.data.professional);
          this.authService.updateProfessionalState(response.data.professional);
        }
        this.storageService.saveTypeOfUser({ keyType: 2 });
        localStorage.setItem('current_view', 'pl');
        this.router.navigate(['/professional/dashboard']);
      },
      error: () => {
        this.router.navigate(['/professional/dashboard']);
      }
    });
  }

  viewProfile() {
    this.router.navigate(['/profile']);
  }
}
