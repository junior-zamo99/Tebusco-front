import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferService } from '../../../services/offer.service';
import { RequestService } from '../../../services/request.service';
import { DialogService } from '../../../services/dialog.service';
import { OfferResponse, OfferStatusEnum } from '../../../models/offer.model';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidates.component.html',
})
export class CandidatesComponent implements OnInit {
  private offerService = inject(OfferService);
  private requestService = inject(RequestService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  requestId: number | null = null;
  request: any = null;
  offers: OfferResponse[] = [];
  isLoading = true;
  isHiring = false;

  readonly OfferStatus = OfferStatusEnum;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || isNaN(Number(id))) {
      this.router.navigate(['/applicant/requests']);
      return;
    }
    this.requestId = Number(id);
    this.loadData();
  }

  loadData(): void {
    if (!this.requestId) return;
    this.isLoading = true;

    this.requestService.getById(this.requestId).subscribe({
      next: (res: any) => {
        this.request = res.data ?? res;
        this.loadCandidates();
      },
      error: () => {
        this.dialogService.error('Error', 'No se pudo cargar la solicitud.');
        this.isLoading = false;
      }
    });
  }

  loadCandidates(): void {
    this.offerService.getCandidates(this.requestId!).subscribe({
      next: (res) => {
        this.offers = res.data ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.dialogService.error('Error', 'No se pudieron cargar los candidatos.');
        this.isLoading = false;
      }
    });
  }

  hire(offer: OfferResponse): void {
    this.dialogService.confirm(
      '¿Contratar a este profesional?',
      `Vas a contratar a ${offer.professional.name ?? ''} ${offer.professional.lastName} por Bs. ${offer.amount}. Las demás ofertas pendientes serán rechazadas automáticamente.`,
      'Sí, contratar',
      'Cancelar'
    ).subscribe(result => {
      if (!result.confirmed) return;
      this.isHiring = true;
      this.offerService.hireOffer(offer.id).subscribe({
        next: () => {
          this.isHiring = false;
          this.dialogService.success(
            '¡Profesional contratado!',
            'El trabajo está en curso. Las demás ofertas han sido rechazadas.'
          ).subscribe(() => {
            this.router.navigate(['/applicant/request', this.requestId]);
          });
        },
        error: (err) => {
          this.isHiring = false;
          const msg = err.error?.message || 'No se pudo contratar al profesional.';
          this.dialogService.error('Error', msg);
        }
      });
    });
  }

  goBack(): void {
    this.location.back();
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

  get canHire(): boolean {
    return this.request?.status === 'PENDING';
  }
}
