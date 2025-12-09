import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfessionalService, CategoryProfile } from '../../services/professional.service';
import { DialogService } from '../../services/dialog.service';

interface ProfileDisplay {
  id: number;
  profileCategoryId: number;
  initials: string;
  name: string;
  isActive: boolean;
  visible: boolean;
  color: string;
  categoryData: CategoryProfile;
}

interface UsageData {
  categories: {
    limit: number;
    used: number;
    available: number;
  };
  offers: {
    limit: number;
    used: number;
    available: number;
  };
}

@Component({
  selector: 'app-active-profiles',
  imports: [CommonModule],
  templateUrl: './active-profiles.html',
  styleUrl: './active-profiles.css',
})
export class ActiveProfiles implements OnInit {
  private professionalService = inject(ProfessionalService);
  private dialogService = inject(DialogService);
  private router = inject(Router);

  profiles: ProfileDisplay[] = [];
  loading = false;
  error: string | null = null;
  professionalId: number | null = null;
  usage: UsageData | null = null;

  ngOnInit() {
    this.loadProfessionalData();
  }

  loadProfessionalData() {
    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.professionalId = response.data.professional.id;
          this.usage = response.data.usage;
          this.loadProfiles();
        }
      },
      error: (error) => {
        console.error('Error al obtener datos del profesional:', error);
        this.error = 'Error al cargar información del profesional';
      }
    });
  }

  loadProfiles() {
    this.loading = true;
    this.error = null;

    this.professionalService.getMyCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.profiles = response.data.map(category => ({
            id: category.id,
            profileCategoryId: category.id,
            initials: this.getInitials(category.categoryName),
            name: category.categoryName,
            isActive: category.isActive && category.visible,
            visible: category.visible,
            color: category.isActive && category.visible
              ? 'from-yellow-500 to-yellow-600'
              : 'from-gray-600 to-gray-700',
            categoryData: category
          }));
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar perfiles:', error);
        this.error = 'Error al cargar los perfiles';
        this.loading = false;
      }
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }



  onProfileClick(profile: ProfileDisplay) {
    if (!this.professionalId) {
      this.dialogService.error('Error', 'No se pudo obtener la información del profesional');
      return;
    }

    const action = profile.visible ? 'ocultar' : 'mostrar';
    const title = profile.visible ? 'Ocultar perfil' : 'Mostrar perfil';
    const message = profile.visible
      ? `¿Estás seguro que deseas ocultar el perfil de ${profile.name}? Los clientes no podrán ver este perfil.`
      : `¿Deseas mostrar el perfil de ${profile.name}? Los clientes podrán ver y contactarte por este perfil.`;

    this.dialogService.confirm(
      title,
      message,
      'Sí, ' + action,
      'Cancelar'
    ).subscribe((result) => {
      if (result.confirmed) {
        this.toggleVisibility(profile);
      }
    });
  }

  private toggleVisibility(profile: ProfileDisplay) {
    if (!this.professionalId) return;

    const action = profile.visible
      ? this.professionalService.setCategoryInvisible(this.professionalId, profile.profileCategoryId)
      : this.professionalService.setCategoryVisible(this.professionalId, profile.profileCategoryId);

    action.subscribe({
      next: (response) => {
        const successMessage = profile.visible
          ? `El perfil de ${profile.name} ha sido ocultado exitosamente`
          : `El perfil de ${profile.name} ahora es visible para los clientes`;

        this.dialogService.success('¡Listo!', successMessage).subscribe(() => {
          this.loadProfiles();
        });
      },
      error: (error) => {
        console.error('Error al cambiar visibilidad:', error);
        this.dialogService.error(
          'Error',
          'No se pudo cambiar la visibilidad del perfil. Por favor intenta nuevamente.'
        );
      }
    });
  }

  onAddProfileClick() {
    if (!this.usage) {
      this.dialogService.error('Error', 'No se pudo obtener la información de uso');
      return;
    }

    if (this.usage.categories.available <= 0) {
      const limitReachedMessage = `Has alcanzado el límite de ${this.usage.categories.limit} categoría${this.usage.categories.limit > 1 ? 's' : ''} de tu plan actual. ¿Deseas adquirir categorías adicionales o mejorar tu plan?`;

      this.dialogService.custom({
        type: 'confirm',
        title: '¡Límite alcanzado!',
        message: limitReachedMessage,
        confirmText: 'Comprar categorías',
        cancelText: 'Cancelar',
        showCancel: true,
        imageUrl: '/assets/pensando.png',
        imageAlt: 'Pensando en opciones',
        imageHeight: '200px'
      }).subscribe((result) => {
        if (result.confirmed) {
          this.router.navigate(['/extras'], { queryParams: { tipo: 'categorías' } });
        }
      });
    } else {
      this.router.navigate(['/configure-category']);
    }
  }
}
