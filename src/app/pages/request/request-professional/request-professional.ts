import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestResponse, RequestStatusEnum } from '../../../models/request.models';
import { RequestService } from '../../../services/request.service';
import { StorageService } from '../../../services/storage.service';
import { ProfessionalService } from '../../../services/professional.service';
import { ProfileCategoryDetail, specialtiesDetail } from '../../../models/professional-complete.model';

@Component({
  selector: 'app-request-professional',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-professional.html',
})
export class RequestProfessional implements OnInit {
  private requestService = inject(RequestService);
  private storageService = inject(StorageService);
  private professionalService = inject(ProfessionalService);
  private router = inject(Router);

  requests: RequestResponse[] = [];
  loading = false;
  error: string | null = null;

  professionalId: number | null = null;
  activeProfileIds: number[] = [];

  currentStatus: RequestStatusEnum = RequestStatusEnum.PENDING;
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  hasNextPage = false;

  statusTabs = [
    { value: RequestStatusEnum.PENDING, label: 'Disponibles' },
    { value: RequestStatusEnum.ACCEPTED, label: 'En Progreso' },
    { value: RequestStatusEnum.COMPLETED, label: 'Completadas' },
  ];

  private urgencyLabels: Record<string, string> = {
    'low': 'Baja', 'medium': 'Media', 'high': 'Alta', 'urgent': 'Urgente', 'emergency': 'Emergencia'
  };

  ngOnInit(): void {
    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.professionalId = response.data.professional.id;
          this.activeProfileIds = response.data.profileCategories
          .filter((pc: ProfileCategoryDetail) => pc.isActive)
          .flatMap((pc: ProfileCategoryDetail) => {
              const specialtyIds = pc.specialties.map((s: specialtiesDetail) => s.id);
              return [pc.categoryId, ...specialtyIds];
          });
          console.log('Active Profile IDs:', this.activeProfileIds);
          this.loadRequests();
        } else {
          this.error = 'No se pudo obtener la información del profesional.';
        }
      },
      error: () => {
        this.error = 'No se pudo obtener la información del profesional.';
      }
    });
  }

  loadRequests(): void {
    if (!this.professionalId) return;

    this.loading = true;
    this.error = null;

    this.requestService.getRequestsByProfessional(
      this.professionalId,
      this.currentStatus,
      { page: this.currentPage, limit: this.itemsPerPage },
      this.activeProfileIds
    ).subscribe({
      next: (response: any) => {
        this.requests = response.data || response;
        if (response.pagination) {
          this.totalItems = response.pagination.totalItems;
          this.hasNextPage = response.pagination.hasNextPage;
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las solicitudes.';
        this.loading = false;
      }
    });
  }

  selectStatus(status: RequestStatusEnum): void {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.currentPage = 1;
      this.loadRequests();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadRequests();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRequests();
    }
  }

  viewRequest(id: number): void {
    this.router.navigate(['/professional/request', id]);
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
