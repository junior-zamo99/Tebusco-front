import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LocationData, MapLocationViewer } from '../../../components/map-location-viewer/map-location-viewer';
import { RequestService } from '../../../services/request.service';
import { RequestStatusEnum } from '../../../models/request.models';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-request-view',
  standalone: true,
  imports: [CommonModule, MapLocationViewer, RouterLink],
  templateUrl: './request-view.html',
  styleUrl: './request-view.css',
})
export class RequestView implements OnInit {
  request: any = null;
  isLoading = true;
  isActionLoading = false;
  errorMessage = '';

  mapLocation: LocationData | null = null;

  private urgencyLabels: { [key: string]: string } = {
    'low': 'Baja', 'medium': 'Media', 'high': 'Alta', 'urgent': 'Urgente', 'emergency': 'Emergencia'
  };

  private route = inject(ActivatedRoute);
  private requestService = inject(RequestService);
  private location = inject(Location);
  private dialogService = inject(DialogService);

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('id');

    if (requestId) {
      this.loadRequest(Number(requestId));
    } else {
      this.errorMessage = 'ID de solicitud no válido';
      this.isLoading = false;
    }
  }

  loadRequest(id: number) {
    this.isLoading = true;

    this.requestService.getById(id).subscribe({
      next: (response: any) => {
        const requestData = response.data;

        if (requestData.categories && Array.isArray(requestData.categories)) {
           requestData.categories.sort((a: any, b: any) => {
              return a.id - b.id;
           });
        }

        this.request = requestData;

        if (requestData.lat && requestData.lng) {
          this.mapLocation = {
            lat: Number(requestData.lat),
            lng: Number(requestData.lng),
            address: requestData.address ?? '',
            fullAddress: requestData.address ?? '',
            label: requestData.title,
            city: 'Santa Cruz',
            country: 'Bolivia'
          };
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando solicitud', err);
        this.errorMessage = 'No se pudo cargar la información de la solicitud.';
        this.isLoading = false;
      }
    });
  }

  updateStatus(newStatus: 'COMPLETED' | 'CANCELLED') {
    if (!this.request) return;

    const isCompleting = newStatus === 'COMPLETED';
    const title = isCompleting ? '¿Completar trabajo?' : '¿Cancelar solicitud?';
    const message = isCompleting
      ? '¿Confirmas que el trabajo se ha realizado correctamente? Esta acción finalizará la solicitud.'
      : '¿Estás seguro de que deseas cancelar esta solicitud? Esta acción no se puede deshacer.';

    const confirmText = isCompleting ? 'Sí, completar' : 'Sí, cancelar';
    const cancelText = 'Volver';


    this.dialogService.confirm(title, message, confirmText, cancelText).subscribe((result) => {

      if (result.confirmed) {
        this.executeStatusChange(newStatus);
      }
    });
  }

  private executeStatusChange(newStatus: 'COMPLETED' | 'CANCELLED') {
    this.isActionLoading = true;

    const statusEnum = newStatus === 'COMPLETED'
      ? RequestStatusEnum.COMPLETED
      : RequestStatusEnum.CANCELLED;

    this.requestService.changeStatus(this.request.id, statusEnum).subscribe({
      next: (response) => {
        const successTitle = newStatus === 'COMPLETED' ? '¡Trabajo Completado!' : 'Solicitud Cancelada';
        const successMsg = newStatus === 'COMPLETED'
          ? 'La solicitud ha sido marcada como completada exitosamente.'
          : 'La solicitud ha sido cancelada correctamente.';

        this.dialogService.success(successTitle, successMsg).subscribe(() => {
           this.loadRequest(this.request.id);
           this.isActionLoading = false;
        });
      },
      error: (err) => {
        console.error('Error cambiando estado', err);
        this.dialogService.error('Error', 'Hubo un problema al actualizar el estado. Por favor intenta nuevamente.').subscribe();
        this.isActionLoading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }



  getUrgencyLabelDisplay(status: string): string {
    if (!status) return '';
    return this.urgencyLabels[status.toLowerCase()] || status;
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-600 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  }

  getStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'pending': 'Pendiente',
      'in_progress': 'En Progreso',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    return labels[status?.toLowerCase()] || status;
  }
}
