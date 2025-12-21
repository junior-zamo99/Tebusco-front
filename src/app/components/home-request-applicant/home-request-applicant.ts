import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  Router, RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { RequestService } from '../../services/request.service';
import { RequestStatusEnum } from '../../models/request.models';

@Component({
  selector: 'app-home-request-applicant',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-request-applicant.html',
  styleUrl: './home-request-applicant.css',
})
export class HomeRequestApplicant implements OnInit {
  requests: any[] = [];
  isLoading = true;

  private storageService = inject(StorageService);
  private requestService = inject(RequestService);


  constructor(
    private router: Router
  ) {}

  private urgencyLabels: Record<string, string> = {
    'low': 'Baja', 'medium': 'Media', 'high': 'Alta', 'urgent': 'Urgente', 'emergency': 'Emergencia'
  };

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    const user = this.storageService.getApplicant();
    if (!user || !user.id) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.requestService.getRequestsByApplicant(
      user.id,
      RequestStatusEnum.PENDING,
      { page: 1, limit: 10 }
    ).subscribe({
      next: (response: any) => {
        this.requests = response.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando solicitudes', err);
        this.isLoading = false;
      }
    });
  }

  // --- HELPERS VISUALES ---

  getUrgencyLabel(urgency: string): string {
    return this.urgencyLabels[urgency?.toLowerCase()] || urgency;
  }

  // Devuelve clases CSS basadas en variables de tu tema
  getUrgencyClass(urgency: string): string {
    switch(urgency?.toLowerCase()) {
      case 'emergency':
      case 'urgent':
      case 'high':
        return 'text-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] border-[var(--color-danger)]';
      case 'medium':
        return 'text-[var(--color-warning)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] border-[var(--color-warning)]';
      default:
        return 'text-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border-[var(--color-success)]';
    }
  }

  getUrgencyBorder(urgency: string): string {
     switch(urgency?.toLowerCase()) {
      case 'emergency':
      case 'urgent':
      case 'high': return 'bg-[var(--color-danger)]';
      case 'medium': return 'bg-[var(--color-warning)]';
      default: return 'bg-[var(--color-success)]';
    }
  }

  goRequestDetails(requestId: string): void {
    this.router.navigate(['/request', requestId]);
  }
}
