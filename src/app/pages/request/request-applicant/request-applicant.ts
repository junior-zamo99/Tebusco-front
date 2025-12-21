import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RequestResponse, RequestStatusEnum } from '../../../models/request.models';
import { RequestService } from '../../../services/request.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-request-applicant',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './request-applicant.html',
  styleUrl: './request-applicant.css',
})
export class RequestApplicant implements OnInit {
  private requestService = inject(RequestService);
  private storageService = inject(StorageService);
  private router = inject(Router);

  // Estados de la UI
  requests: RequestResponse[] = [];
  loading = false;
  error: string | null = null;
  activeMenuRequestId: number | null = null;

  // Datos de usuario y paginación
  applicantData: any = null;
  applicantId: number | null = null;
  currentStatus: RequestStatusEnum = RequestStatusEnum.PENDING;
  currentPage = 1;
  itemsPerPage = 6; // Ajustado para un grid de 3x2
  totalItems = 0;

  // Configuración de Tabs
  statusTabs = [
    { value: RequestStatusEnum.PENDING, label: 'Pendientes', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: RequestStatusEnum.COMPLETED, label: 'Completadas', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: RequestStatusEnum.CANCELLED, label: 'Canceladas', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  private urgencyLabels: Record<string, string> = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'urgent': 'Urgente',
    'emergency': 'Emergencia'
  };

  ngOnInit(): void {
    const applicant = this.storageService.getApplicant();

    if (applicant && applicant.id) {
      this.applicantData = applicant;
      this.applicantId = applicant.id;
      this.loadRequests();
    } else {
      this.error = 'No se encontró información del solicitante. Por favor, inicia sesión nuevamente.';
    }
  }

  // --- Lógica de Carga de Datos ---

  loadRequests(): void {
    if (!this.applicantId) return;

    this.loading = true;
    this.error = null;

    this.requestService.getRequestsByApplicant(
      this.applicantId,
      this.currentStatus,
      { page: this.currentPage, limit: this.itemsPerPage }
    ).subscribe({
      next: (response: any) => {
        // Maneja tanto si el backend devuelve data[] o el array directo
        this.requests = response.data || response;
        if (response.meta) this.totalItems = response.meta.totalItems;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading requests:', err);
        this.error = 'No se pudieron cargar las solicitudes en este momento.';
        this.loading = false;
      }
    });
  }

  // --- Manejo de UI y Navegación ---

  selectStatus(status: RequestStatusEnum): void {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.currentPage = 1;
      this.loadRequests();
    }
  }

  nextPage(): void {
    if (this.requests.length >= this.itemsPerPage) {
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

  toggleMenu(requestId: number, event: Event): void {
    event.stopPropagation();
    this.activeMenuRequestId = this.activeMenuRequestId === requestId ? null : requestId;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.activeMenuRequestId = null;
  }

  // --- Helpers Estéticos (Sincronizados con el diseño de la imagen) ---

  getUrgencyText(urgency: string): string {
    return this.urgencyLabels[urgency?.toLowerCase()] || urgency;
  }

  /**
   * Retorna las clases para el badge de color sutil
   */
  getUrgencyColor(urgency: string): string {
    switch(urgency?.toLowerCase()) {
      case 'emergency':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'urgent':
      case 'high':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-emerald-500 bg-emerald-400/10 border-emerald-400/20';
    }
  }

  /**
   * Retorna el gradiente para la línea superior de la tarjeta (Branding dinámico)
   */
  getTopBarGradient(urgency: string): string {
    switch(urgency?.toLowerCase()) {
      case 'emergency': return 'from-orange-400 to-orange-600';
      case 'urgent':
      case 'high':      return 'from-red-500 to-red-700';
      case 'medium':    return 'from-blue-400 to-blue-600';
      default:          return 'from-emerald-400 to-emerald-600';
    }
  }

  // --- Acciones de Router ---

  createRequest(): void {
    this.router.navigate(['/applicant/request/create']);
  }

  viewRequest(id: number): void {
    this.router.navigate(['/applicant/request', id]);
  }

  editRequest(id: number): void {
    this.router.navigate(['/request-edit', id]);
  }

  deleteRequest(id: number): void {
    if(confirm('¿Estás seguro de que deseas eliminar esta solicitud?')) {
      this.loading = true;
      this.requestService.delete(id).subscribe({
        next: () => this.loadRequests(),
        error: () => {
          this.error = 'Error al eliminar la solicitud.';
          this.loading = false;
        }
      });
    }
  }
}
