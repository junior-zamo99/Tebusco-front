import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationStatus, ProfessionalInfo } from '../../models/professional-complete.model';

@Component({
  selector: 'app-registration-status-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registration-status-banner.component.html',
  styleUrls: ['./registration-status-banner.component.css']
})
export class RegistrationStatusBannerComponent {
  @Input() registrationStatus!: RegistrationStatus;
  @Input() professional!: ProfessionalInfo;
  @Output() goToDocuments = new EventEmitter<void>();

  getDaysUntilDeadline(): number {
    if (!this.professional?.documentsDeadline) return 0;
    const deadline = new Date(this.professional.documentsDeadline).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((deadline - now) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  }

  getDeadlineDate(): string {
    if (!this.professional?.documentsDeadline) return '';
    return new Date(this.professional.documentsDeadline).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusIcon(): string {
    switch (this.registrationStatus?.status) {
      case 'approved':
        return 'fas fa-check-circle';
      case 'rejected':
        return 'fas fa-times-circle';
      case 'pending':
      default:
        return 'fas fa-clock';
    }
  }

  getStatusClasses(): string {
    switch (this.registrationStatus?.status) {
      case 'approved':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      case 'rejected':
        return 'bg-red-500/10 border-red-500/30 text-red-300';
      case 'pending':
      default:
        return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
    }
  }

  shouldShowDocumentAlert(): boolean {
    return this.registrationStatus?.status === 'pending' && 
           this.registrationStatus?.documentsUploaded < this.registrationStatus?.documentsRequired;
  }

  shouldShowDeadlineAlert(): boolean {
    return this.shouldShowDocumentAlert() && this.getDaysUntilDeadline() <= 7;
  }

  getDocumentProgress(): number {
    if (!this.registrationStatus) return 0;
    return (this.registrationStatus.documentsUploaded / this.registrationStatus.documentsRequired) * 100;
  }
}
