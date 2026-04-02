import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { ProfessionalService } from '../../services/professional.service';
import { RequestResponse, RequestStatusEnum } from '../../models/request.models';
import { ProfileCategoryDetail, specialtiesDetail } from '../../models';

@Component({
  selector: 'app-home-request-professional',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-request-professional.html',
})
export class HomeRequestProfessional implements OnInit {
  private requestService = inject(RequestService);
  private professionalService = inject(ProfessionalService);
  private router = inject(Router);

  requests: RequestResponse[] = [];
  loading = true;

  private urgencyLabels: Record<string, string> = {
    'low': 'Baja', 'medium': 'Media', 'high': 'Alta', 'urgent': 'Urgente', 'emergency': 'Emergencia'
  };

  ngOnInit(): void {
    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const professionalId = response.data.professional.id;
          const activeProfileIds = response.data.profileCategories
          .filter((pc: ProfileCategoryDetail) => pc.isActive)
          .flatMap((pc: ProfileCategoryDetail) => {
              const specialtyIds = pc.specialties.map((s: specialtiesDetail) => s.id);
              return [pc.categoryId, ...specialtyIds];
          });

          this.loadRequests(professionalId, activeProfileIds);
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadRequests(professionalId: number, activeProfileIds: number[]): void {
    this.requestService.getRequestsByProfessional(
      professionalId,
      RequestStatusEnum.PENDING,
      { page: 1, limit: 4 },
      activeProfileIds
    ).subscribe({
      next: (response: any) => {
        this.requests = response.data || response || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  viewRequest(id: number): void {
    this.router.navigate(['/professional/request', id]);
  }

  viewAll(): void {
    this.router.navigate(['/professional/requests']);
  }

  getUrgencyText(urgency: string): string {
    return this.urgencyLabels[urgency?.toLowerCase()] || urgency;
  }

  getUrgencyColor(urgency: string): string {
    switch (urgency?.toLowerCase()) {
      case 'emergency': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'urgent':
      case 'high':      return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium':    return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:          return 'text-emerald-500 bg-emerald-400/10 border-emerald-400/20';
    }
  }

  getTopBarGradient(urgency: string): string {
    switch (urgency?.toLowerCase()) {
      case 'emergency': return 'from-orange-400 to-orange-600';
      case 'urgent':
      case 'high':      return 'from-red-500 to-red-700';
      case 'medium':    return 'from-blue-400 to-blue-600';
      default:          return 'from-emerald-400 to-emerald-600';
    }
  }
}
