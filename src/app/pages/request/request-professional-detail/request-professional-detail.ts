import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RequestService } from '../../../services/request.service';
import { OfferService } from '../../../services/offer.service';
import { DialogService } from '../../../services/dialog.service';
import { OfferResponse, OfferStatusEnum, CreateOfferDTO } from '../../../models/offer.model';

@Component({
  selector: 'app-request-professional-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './request-professional-detail.html',
})
export class RequestProfessionalDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private requestService = inject(RequestService);
  private offerService = inject(OfferService);
  private dialogService = inject(DialogService);
  private fb = inject(FormBuilder);

  requestId: number | null = null;
  request: any = null;
  myOffer: OfferResponse | null = null;

  isLoading = true;
  isSubmitting = false;
  isCancelling = false;
  isSavingEdit = false;

  showPostulateForm = false;
  showEditForm = false;

  postulateForm!: FormGroup;
  editForm!: FormGroup;

  readonly OfferStatus = OfferStatusEnum;

  private urgencyLabels: Record<string, string> = {
    'low': 'Baja', 'medium': 'Media', 'high': 'Alta', 'urgent': 'Urgente', 'emergency': 'Emergencia'
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || isNaN(Number(id))) {
      this.router.navigate(['/professional/requests']);
      return;
    }
    this.requestId = Number(id);
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.showPostulateForm = false;
    this.showEditForm = false;

    this.requestService.getById(this.requestId!).subscribe({
      next: (res: any) => {
        this.request = res.data ?? res;
        this.loadMyOffer();
      },
      error: () => {
        this.dialogService.error('Error', 'No se pudo cargar la solicitud.');
        this.isLoading = false;
      }
    });
  }

  loadMyOffer(): void {
    this.offerService.getMyOfferForRequest(this.requestId!).subscribe({
      next: (res) => {
        this.myOffer = res.data ?? null;
        this.isLoading = false;
      },
      error: (err) => {
        // 404 means no offer yet — that's fine
        if (err.status === 404) {
          this.myOffer = null;
        }
        this.isLoading = false;
      }
    });
  }

  openPostulateForm(): void {
    this.postulateForm = this.fb.group({
      amount: [null],
      currency: ['BOB'],
      description: [''],
      estimatedDuration: [''],
    });
    this.showPostulateForm = true;
  }

  closePostulateForm(): void {
    this.showPostulateForm = false;
  }

  submitPostulate(): void {
    if (this.postulateForm.invalid) { this.postulateForm.markAllAsTouched(); return; }
    this.isSubmitting = true;
    const raw = this.postulateForm.value;
    const data: CreateOfferDTO = {
      requestId: this.requestId!,
      amount: raw.amount,
      currency: raw.currency || 'BOB',
      description: raw.description || undefined,
      estimatedDuration: raw.estimatedDuration || undefined,
    };
    this.offerService.postulate(data).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.dialogService.success('¡Postulación enviada!', 'Tu oferta ha sido enviada al solicitante.').subscribe(() => {
          this.loadData();
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'No se pudo enviar la postulación.';
        this.dialogService.error('Error', msg);
      }
    });
  }

  openEditForm(): void {
    if (!this.myOffer) return;
    this.editForm = this.fb.group({
      amount: [this.myOffer.amount],
      description: [this.myOffer.description ?? ''],
      estimatedDuration: [this.myOffer.estimatedDuration ?? ''],
    });
    this.showEditForm = true;
  }

  closeEditForm(): void {
    this.showEditForm = false;
  }

  saveEdit(): void {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    this.isSavingEdit = true;
    const raw = this.editForm.value;
    this.offerService.editOffer(this.myOffer!.id, {
      amount: raw.amount,
      description: raw.description || undefined,
      estimatedDuration: raw.estimatedDuration || undefined,
    }).subscribe({
      next: () => {
        this.isSavingEdit = false;
        this.showEditForm = false;
        this.loadData();
      },
      error: (err) => {
        this.isSavingEdit = false;
        const msg = err.error?.message || 'No se pudo actualizar la oferta.';
        this.dialogService.error('Error', msg);
      }
    });
  }

  cancelOffer(): void {
    if (!this.myOffer) return;
    this.dialogService.confirm(
      '¿Retirar oferta?',
      'Vas a retirar tu postulación. Esta acción no se puede deshacer.',
      'Sí, retirar',
      'Cancelar'
    ).subscribe(result => {
      if (!result.confirmed) return;
      this.isCancelling = true;
      this.offerService.cancelOffer(this.myOffer!.id).subscribe({
        next: () => {
          this.isCancelling = false;
          this.dialogService.success('Oferta retirada', 'Tu postulación ha sido cancelada.').subscribe(() => {
            this.loadData();
          });
        },
        error: (err) => {
          this.isCancelling = false;
          const msg = err.error?.message || 'No se pudo retirar la oferta.';
          this.dialogService.error('Error', msg);
        }
      });
    });
  }

  goBack(): void {
    this.location.back();
  }

  getUrgencyLabel(urgency: string): string {
    return this.urgencyLabels[urgency?.toLowerCase()] ?? urgency;
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

  get canPostulate(): boolean {
    return this.request?.status === 'PENDING' && !this.myOffer;
  }

  get canEditOffer(): boolean {
    return this.myOffer?.status === 'PENDING';
  }

  get canCancelOffer(): boolean {
    return this.myOffer?.status === 'PENDING';
  }
}
