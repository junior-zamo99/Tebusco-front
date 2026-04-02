import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OfferService } from '../../services/offer.service';
import { OfferResponse, OfferStatusEnum } from '../../models/offer.model';

@Component({
  selector: 'app-pending-offers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-offers.html',
})
export class PendingOffers implements OnInit {
  private offerService = inject(OfferService);
  private router = inject(Router);

  offers: OfferResponse[] = [];
  isLoading = true;

  readonly OfferStatus = OfferStatusEnum;

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.offerService.getMyHistory('active', { page: 1, limit: 4 }).subscribe({
      next: (res) => {
        this.offers = res.data ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  viewAll(): void {
    this.router.navigate(['/professional/offers']);
  }

  viewRequest(requestId: number): void {
    this.router.navigate(['/professional/request', requestId]);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente', 'ACCEPTED': 'Aceptada',
      'REJECTED': 'Rechazada', 'CANCELLED': 'Cancelada', 'VOIDED': 'Vencida'
    };
    return labels[status] ?? status;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':   return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'ACCEPTED':  return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'REJECTED':  return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'CANCELLED': return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      case 'VOIDED':    return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default:          return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  }

  getUrgencyLabel(urgency: string): string {
    const labels: Record<string, string> = {
      'low': 'Baja', 'medium': 'Media', 'high': 'Alta', 'urgent': 'Urgente', 'emergency': 'Emergencia'
    };
    return labels[urgency?.toLowerCase()] ?? urgency;
  }
}
