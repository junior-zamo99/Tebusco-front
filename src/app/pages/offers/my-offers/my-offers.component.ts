import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OfferService } from '../../../services/offer.service';
import { DialogService } from '../../../services/dialog.service';
import { OfferResponse, OfferStatusEnum, OfferHistoryType } from '../../../models/offer.model';

@Component({
  selector: 'app-my-offers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-offers.component.html',
})
export class MyOffersComponent implements OnInit {
  private offerService = inject(OfferService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  offers: OfferResponse[] = [];
  isLoading = false;
  currentType: OfferHistoryType = 'active';
  currentPage = 1;
  itemsPerPage = 10;
  hasNextPage = false;
  totalItems = 0;

  editingOfferId: number | null = null;
  editForm!: FormGroup;
  isSaving = false;

  readonly OfferStatus = OfferStatusEnum;

  tabs: { value: OfferHistoryType; label: string }[] = [
    { value: 'active', label: 'Activas' },
    { value: 'history', label: 'Rechazadas' },
    { value: 'all', label: 'Todas' },
  ];

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.isLoading = true;
    this.offerService.getMyHistory(this.currentType, { page: this.currentPage, limit: this.itemsPerPage }).subscribe({
      next: (res) => {
        this.offers = res.data ?? [];
        if (res.pagination) {
          this.hasNextPage = res.pagination.hasNextPage;
          this.totalItems = res.pagination.totalItems;
        }
        this.isLoading = false;
      },
      error: () => {
        this.dialogService.error('Error', 'No se pudieron cargar tus ofertas.');
        this.isLoading = false;
      }
    });
  }

  selectTab(type: OfferHistoryType): void {
    if (this.currentType !== type) {
      this.currentType = type;
      this.currentPage = 1;
      this.editingOfferId = null;
      this.loadOffers();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) { this.currentPage++; this.loadOffers(); }
  }

  previousPage(): void {
    if (this.currentPage > 1) { this.currentPage--; this.loadOffers(); }
  }

  startEdit(offer: OfferResponse): void {
    this.editingOfferId = offer.id;
    this.editForm = this.fb.group({
      amount: [offer.amount, [Validators.required, Validators.min(0.01)]],
      description: [offer.description ?? ''],
      estimatedDuration: [offer.estimatedDuration ?? ''],
    });
  }

  cancelEdit(): void {
    this.editingOfferId = null;
  }

  saveEdit(offerId: number): void {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    this.isSaving = true;
    const raw = this.editForm.value;
    const data = {
      amount: raw.amount,
      description: raw.description || undefined,
      estimatedDuration: raw.estimatedDuration || undefined,
    };
    this.offerService.editOffer(offerId, data).subscribe({
      next: () => {
        this.isSaving = false;
        this.editingOfferId = null;
        this.loadOffers();
      },
      error: (err) => {
        this.isSaving = false;
        const msg = err.error?.message || 'No se pudo actualizar la oferta.';
        this.dialogService.error('Error', msg);
      }
    });
  }

  cancelOffer(offer: OfferResponse): void {
    this.dialogService.confirm(
      '¿Retirar oferta?',
      `Vas a retirar tu oferta de Bs. ${offer.amount} para "${offer.request.title}". Esta acción no se puede deshacer.`,
      'Sí, retirar',
      'Cancelar'
    ).subscribe(result => {
      if (!result.confirmed) return;
      this.offerService.cancelOffer(offer.id).subscribe({
        next: () => {
          this.dialogService.success('Oferta retirada', 'Tu oferta ha sido retirada correctamente.').subscribe(() => {
            this.loadOffers();
          });
        },
        error: (err) => {
          const msg = err.error?.message || 'No se pudo retirar la oferta.';
          this.dialogService.error('Error', msg);
        }
      });
    });
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
