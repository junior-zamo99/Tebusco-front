import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RegistrationStatus,
  ProfessionalInfo,
  InfoExtra,
  DocumentsSummary,
} from '../../models/professional-complete.model';

export type HeroType = 'default' | 'subscription' | 'renewal' | 'documents' | 'categories' | 'profile';

@Component({
  selector: 'app-professional-hero',
  imports: [CommonModule],
  templateUrl: './professional-hero.html',
  styleUrl: './professional-hero.css',
})
export class ProfessionalHero {
  @Input() registrationStatus: RegistrationStatus | null = null;
  @Input() professional: ProfessionalInfo | null = null;
  @Input() infoExtra: InfoExtra | null = null;
  @Input() documents: DocumentsSummary | null = null;

  @Output() goToPayment = new EventEmitter<void>();
  @Output() goToDocuments = new EventEmitter<void>();
  @Output() goToCategories = new EventEmitter<void>();
  @Output() goToProfile = new EventEmitter<void>();

  stats = [
    { icon: 'briefcase', value: '150+', label: 'Solicitudes Activas' },
    { icon: 'users', value: '2,500+', label: 'Clientes Potenciales' },
    { icon: 'star', value: '4.8', label: 'Calificación Promedio' }
  ];


 getHeroType(): HeroType {
    console.log("Documents:", this.documents);
    if (!this.registrationStatus || !this.infoExtra) {
      return 'default';
    }

    if (this.registrationStatus.currentStep === 'payment' && !this.infoExtra.hadSubscription) {
      return 'subscription';
    }

    if (this.infoExtra.hadSubscription && !this.registrationStatus.hasActiveSubscription) {
      return 'renewal';
    }

    if (this.documents && this.documents.list) {
      const mandatoryDocs = ['ci_front', 'ci_back', 'selfie', 'selfie_with_ci'];

      const hasPendingMandatoryDocs = mandatoryDocs.some(docType => {
        const doc = this.documents!.list.find(d => d.documentType === docType);
        return !doc || doc.status === 'pending' || doc.status === 'rejected';
      });

      if (hasPendingMandatoryDocs) {
        return 'documents';
      }
    }

    if (this.registrationStatus.categoriesConfigured === 0) {
      return 'categories';
    }

    if (this.professional && (!this.professional.avatarUrl || !this.professional.whatsappNumber)) {
      return 'profile';
    }

    return 'default';
  }

  getDaysUntilDeadline(): number {
    if (!this.professional?.documentsDeadline) return 0;
    const deadline = new Date(this.professional.documentsDeadline).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((deadline - now) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  }

  getDocumentProgress(): number {
    if (!this.documents || this.documents.total === 0) return 0;
    return (this.documents.uploaded / this.documents.total) * 100;
  }






  handleAction(): void {
    const type = this.getHeroType();
    switch (type) {
      case 'subscription':
      case 'renewal':
        this.goToPayment.emit();
        break;
      case 'documents':
        this.goToDocuments.emit();
        break;
      case 'categories':
        this.goToCategories.emit();
        break;
      case 'profile':
        this.goToProfile.emit();
        break;
    }
  }
}
