import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfessionalService } from '../../services/professional.service';
import { ProfessionalCompleteData } from '../../models/professional-complete.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-professional-personal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-professional-personal.html',
  styleUrl: './profile-professional-personal.css',
})
export class ProfileProfessionalPersonal implements OnInit {
  professionalData: ProfessionalCompleteData | null = null;
  loading = true;
  error: string | null = null;
  imageLoadFailed = false;

  activeTab: string = 'profile';

  tabs = [
    { id: 'profile', label: 'Perfil Público', icon: 'fas fa-user' },
    { id: 'categories', label: 'Categorías & Servicios', icon: 'fas fa-briefcase' },
    { id: 'subscription', label: 'Plan & Facturación', icon: 'fas fa-file-invoice-dollar' },
    { id: 'documents', label: 'Documentos Legales', icon: 'fas fa-passport' }
  ];

  constructor(
    private professionalService: ProfessionalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfessionalData();
  }

  loadProfessionalData() {
    this.loading = true;
    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        if (response.success) {
          this.professionalData = response.data;
          this.imageLoadFailed = false;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error de conexión';
        this.loading = false;
      }
    });
  }

  editProfile() {
    this.router.navigate(['/edit-professional-profile']);
  }

  goToCategoryDetail(categoryId: number) {
    this.router.navigate(['/profile/categories', categoryId]);
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  getInitials(): string {
    if (!this.professionalData?.user) return '';
    const { name, lastName } = this.professionalData.user;
    return (name.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  handleImageError() {
    this.imageLoadFailed = true;
  }

  getStatusBadgeClass(status: string): string {
    const map: { [key: string]: string } = {
      'active': 'badge-success', 'approved': 'badge-success', 'verified': 'badge-success',
      'pending': 'badge-warning', 'review': 'badge-warning',
      'rejected': 'badge-danger', 'inactive': 'badge-danger',
      'documents_uploaded': 'badge-secondary', 'visible': 'badge-primary'
    };
    return map[status] || 'badge-neutral';
  }

  getDocumentTypeName(type: string): string {
    const types: {[key: string]: string} = {
      'ci_front': 'Cédula (Frente)', 'ci_back': 'Cédula (Dorso)', 'selfie': 'Selfie con documento',
      'certificate': 'Certificado Profesional', 'curriculum': 'Curriculum Vitae'
    };
    return types[type] || type;
  }

  getProgressPercentage(used: number, limit: number | string): number {
    if (limit === 'Ilimitado') return 0;
    if (typeof limit === 'number' && limit > 0) return Math.min(100, (used / limit) * 100);
    return 0;
  }

  getDocsCompletionPercentage(): number {
    if (!this.professionalData) return 0;
    const { required, approved } = this.professionalData.documents;
    return required > 0 ? Math.round((approved / required) * 100) : 100;
  }

  formatDate(date: string | Date): string {
    if(!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getCleanWhatsappNumber(phone: string): string {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  }

  getAvatarUrl(): string {
    if (!this.professionalData?.professional?.avatarUrl) return 'assets/default-business.png';
    if (this.professionalData.professional.avatarUrl.startsWith('http')) return this.professionalData.professional.avatarUrl;
    return `${environment.backendUrl}${this.professionalData.professional.avatarUrl}`;
  }

  getPhotoUrl(): string {
    if (!this.professionalData?.user?.photoUrl) return 'assets/default-avatar.png';
    if (this.professionalData.user.photoUrl.startsWith('http')) return this.professionalData.user.photoUrl;
    return `${environment.backendUrl}${this.professionalData.user.photoUrl}`;
  }



getTotalSpecialties(): number {
  return this.professionalData!.profileCategories.reduce((total, cat) => total + cat.specialtiesCount, 0);
}

getActiveCategories(): number {
  return this.professionalData!.profileCategories.filter(cat => cat.isActive).length;
}

getCategoryIcon(index: number): string {
  const icons = ['💻', '🗣️', '🎨', '📊', '⚡', '🔧', '📱', '🌐'];
  return icons[index % icons.length];
}

getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    'pending': 'Pendiente',
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'active': 'Activo'
  };
  return labels[status] || status;
}


// Agrega estas funciones a tu componente TypeScript

getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'active': 'Activo',
    'pending': 'Pendiente',
    'cancelled': 'Cancelado',
    'expired': 'Expirado',
    'paused': 'Pausado'
  };
  return statusMap[status] || status;
}

getPlanPrice(): string {
  // Aquí podrías tener un mapa de precios según el plan
  const priceMap: { [key: string]: string } = {
    'BASIC': '$9.99',
    'PRO': '$29.99',
    'PREMIUM': '$49.99',
    'ENTERPRISE': '$99.99'
  };
  return (this.professionalData?.subscription?.planCode && priceMap[this.professionalData.subscription.planCode]) || '$0.00';
}

formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

getDaysRemaining(): number {
  if (!this.professionalData?.subscription?.endDate) return 0;
  const endDate = new Date(this.professionalData.subscription.endDate);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

getUsagePercentage(type: 'categories' | 'offers'): number {
  if (!this.professionalData) return 0;
  const usage = this.professionalData.usage[type];
  if (typeof usage.limit !== 'number' || usage.limit === 0) return 0;
  return Math.round((usage.used / usage.limit) * 100);
}

viewCategoryDetail(categoryId: number) {
  this.router.navigate(['/category-detail', categoryId]);
}


}
