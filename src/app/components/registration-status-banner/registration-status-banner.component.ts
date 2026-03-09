import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RegistrationStatus,
  ProfessionalInfo,
  InfoExtra,
  DocumentsSummary,
  PriorityBanner
} from '../../models/professional-complete.model';

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
  @Input() infoExtra!: InfoExtra;
  @Input() documents!: DocumentsSummary;

  @Output() goToPayment = new EventEmitter<void>();
  @Output() goToDocuments = new EventEmitter<void>();
  @Output() goToCategories = new EventEmitter<void>();
  @Output() goToProfile = new EventEmitter<void>();

  /**
   * Calcula el banner de máxima prioridad que debe mostrarse.
   * Solo muestra UN banner a la vez, según el orden de prioridad.
   */
  getCurrentBanner(): PriorityBanner | null {
    // Prioridad 1: Suscripción inicial pendiente (bloqueante)
    if (this.shouldShowSubscriptionBanner()) {
      return {
        priority: 1,
        type: 'subscription',
        title: '¡Termina tu registro!',
        message: 'Selecciona un plan de suscripción para activar tu perfil y empezar a recibir clientes.',
        icon: 'fas fa-credit-card',
        actionText: 'Seleccionar Plan',
        actionRoute: '/upgrade/plans',
        urgencyLevel: 'blocking'
      };
    }

    // Prioridad 2: Renovación de suscripción vencida
    if (this.shouldShowRenewalBanner()) {
      return {
        priority: 2,
        type: 'renewal',
        title: '¡Tu suscripción ha expirado!',
        message: 'Tu perfil está oculto para los clientes. Renueva tu plan para seguir visible.',
        icon: 'fas fa-exclamation-triangle',
        actionText: 'Renovar Plan',
        actionRoute: '/upgrade/plans',
        urgencyLevel: 'urgent'
      };
    }

    // Prioridad 3: Documentos pendientes (con urgencia si hay fecha límite cercana)
    if (this.shouldShowDocumentsBanner()) {
      const daysLeft = this.getDaysUntilDeadline();
      const deadline = this.getDeadlineDate();
      const isUrgent = daysLeft <= 7;

      return {
        priority: 2,
        type: 'documents',
        title: isUrgent ? '⚠️ Documentación urgente' : 'Sube tu documentación',
        message: deadline
          ? `Tienes hasta el ${deadline} para subir tus documentos (Carnet, Selfie, CV) y verificar tu cuenta.`
          : 'Sube tu documentación (Carnet, Selfie, CV) para verificar tu cuenta.',
        icon: 'fas fa-file-upload',
        actionText: 'Subir Documentos',
        actionRoute: '/professional/profile/documents',
        urgencyLevel: isUrgent ? 'urgent' : 'functional',
        deadline: this.professional?.documentsDeadline ? new Date(this.professional.documentsDeadline) : undefined
      };
    }

    // Prioridad 4: Sin categorías configuradas
    if (this.shouldShowCategoriesBanner()) {
      return {
        priority: 3,
        type: 'categories',
        title: 'Configura tus servicios',
        message: 'No has seleccionado ningún servicio. Los clientes no podrán encontrarte en las búsquedas.',
        icon: 'fas fa-briefcase',
        actionText: 'Configurar Servicios',
        actionRoute: '/professional/profile/categories',
        urgencyLevel: 'functional'
      };
    }

    // Prioridad 5: Perfil incompleto (foto/WhatsApp)
    if (this.shouldShowProfileIncompleteBanner()) {
      return {
        priority: 4,
        type: 'profile',
        title: 'Completa tu perfil',
        message: 'Los perfiles con foto y número de WhatsApp consiguen más clientes. ¡Mejora tu perfil!',
        icon: 'fas fa-user-edit',
        actionText: 'Editar Perfil',
        actionRoute: '/professional/profile/edit',
        urgencyLevel: 'optional'
      };
    }

    return null;
  }

  // === Condiciones para cada banner ===

  /**
   * Banner de suscripción inicial: usuario en paso de pago y nunca tuvo suscripción
   */
  private shouldShowSubscriptionBanner(): boolean {
    return this.registrationStatus?.currentStep === 'payment' &&
           !this.infoExtra?.hadSubscription;
  }

  /**
   * Banner de renovación: tuvo suscripción pero ya no está activa
   */
  private shouldShowRenewalBanner(): boolean {
    return this.infoExtra?.hadSubscription === true &&
           !this.registrationStatus?.hasActiveSubscription;
  }

  /**
   * Banner de documentos: hay documentos por subir
   */
  private shouldShowDocumentsBanner(): boolean {
    if (!this.documents) return false;
    return this.documents.uploaded < this.documents.total;
  }

  /**
   * Banner de categorías: no ha configurado ninguna categoría
   */
  private shouldShowCategoriesBanner(): boolean {
    return this.registrationStatus?.categoriesConfigured === 0;
  }

  /**
   * Banner de perfil incompleto: falta avatar o WhatsApp
   */
  private shouldShowProfileIncompleteBanner(): boolean {
    return !this.professional?.avatarUrl || !this.professional?.whatsappNumber;
  }

  // === Utilidades ===

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
      day: 'numeric',
      month: 'long'
    });
  }

  getDocumentProgress(): number {
    if (!this.documents || this.documents.total === 0) return 0;
    return (this.documents.uploaded / this.documents.total) * 100;
  }

  getUrgencyClasses(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case 'blocking':
        return 'border-red-500/50 bg-red-500/10';
      case 'urgent':
        return 'border-amber-500/50 bg-amber-500/10';
      case 'functional':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'optional':
      default:
        return 'border-slate-500/50 bg-slate-500/10';
    }
  }

  getIconClasses(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case 'blocking':
        return 'text-red-400 bg-red-500/20';
      case 'urgent':
        return 'text-amber-400 bg-amber-500/20';
      case 'functional':
        return 'text-blue-400 bg-blue-500/20';
      case 'optional':
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  }

  getButtonClasses(urgencyLevel: string): string {
    switch (urgencyLevel) {
      case 'blocking':
        return 'bg-red-600 hover:bg-red-500';
      case 'urgent':
        return 'bg-amber-600 hover:bg-amber-500';
      case 'functional':
        return 'bg-blue-600 hover:bg-blue-500';
      case 'optional':
      default:
        return 'bg-slate-600 hover:bg-slate-500';
    }
  }

  handleAction(banner: PriorityBanner): void {
    switch (banner.type) {
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
