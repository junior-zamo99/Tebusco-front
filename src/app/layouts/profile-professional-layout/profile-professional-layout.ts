import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { ProfessionalService } from '../../services/professional.service';
import { ProfessionalCompleteData } from '../../models/professional-complete.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-professional-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './profile-professional-layout.html',
  styleUrl: './profile-professional-layout.css',
})
export class ProfileProfessionalLayout implements OnInit {
  professionalData: ProfessionalCompleteData | null = null;
  loading = true;

  tabs = [
    { path: 'info', label: 'Información Personal', icon: 'fas fa-user' },
    { path: 'categories', label: 'Servicios y Categorías', icon: 'fas fa-briefcase' },
    { path: 'stats', label: 'Visualizaciones', icon: 'fas fa-chart-line' },
    { path: 'subscription', label: 'Plan y Facturación', icon: 'fas fa-credit-card' },
    { path: 'documents', label: 'Documentos', icon: 'fas fa-file-contract' }
  ];

  constructor(
    private professionalService: ProfessionalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfessionalData();
  }

  loadProfessionalData() {
    this.loading = true;
    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        if (response.success) {
          this.professionalData = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getPhotoUrl(): string {
    if (!this.professionalData?.professional?.avatarThumbnailUrl) return 'assets/default-avatar.png';
    if (this.professionalData.professional.avatarThumbnailUrl.startsWith('http')) {
      return this.professionalData.professional.avatarThumbnailUrl;
    }
    return `${environment.backendUrl}${this.professionalData.professional.avatarThumbnailUrl}`;
  }

  goBack() {
    this.router.navigate(['/professional/dashboard']);
  }
}
