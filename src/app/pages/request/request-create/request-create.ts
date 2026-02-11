import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategorySelectorRequest } from '../../../components/category-selector-request/category-selector-request';
import { RequestForm } from '../../../components/request-form/request-form';
import { CategoryNode } from '../../../models/category.model';
import { RequestCategoryInput, CreateRequestDTO } from '../../../models/request.models';
import { DialogService } from '../../../services/dialog.service';
import { RequestService } from '../../../services/request.service';

@Component({
  selector: 'app-request-create',
  standalone: true,
  imports: [CommonModule, CategorySelectorRequest, RequestForm],
  templateUrl: './request-create.html',
})
export class RequestCreate {

  currentStep: 1 | 2 = 1;
  selectedCategories: CategoryNode[] = [];
  isSubmitting = false;

  constructor(
    private requestService: RequestService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  onCategoriesConfirmed(categories: CategoryNode[]): void {
    this.selectedCategories = categories;
    this.currentStep = 2;
    // Scroll al inicio para mejorar la UX al cambiar de paso
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onBackToCategories(): void {
    this.currentStep = 1;
  }

  onCreateRequest(formData: any): void {
    // 1. Validar categorías
    if (this.selectedCategories.length === 0) {
      this.dialogService.warning(
        'Faltan datos',
        'Por favor selecciona al menos una categoría antes de continuar.'
      );
      return;
    }

    this.isSubmitting = true;

    // 2. Mapear categorías al formato que espera el Backend (CategoryRequestInput)
    const categoriesInput: RequestCategoryInput[] = this.selectedCategories.map(cat => ({
      categoryId: cat.id,
      level: cat.level,
      parentId: cat.parentId || null
    }));

    // 3. Construir el DTO
    // Nota: formData ya incluye cityId y address del RequestForm actualizado
    const payload: CreateRequestDTO = {
      title: formData.title,
      description: formData.description,
      urgency: formData.urgency,
      budget: formData.budget,
      dateNeeded: formData.dateNeeded,
      hourPreferred: formData.hourPreferred,
      cityId: formData.cityId, // Dato crítico agregado
      address: formData.address,
      categories: categoriesInput,
      // lat y lng son opcionales en el DTO, no los enviamos si no usamos mapa
    };

    // 4. Llamar al servicio
    this.requestService.create(payload).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.dialogService.success(
          '¡Solicitud Publicada!',
          'Tu solicitud ha sido creada correctamente. Los profesionales en tu ciudad podrán verla pronto.'
        ).subscribe(() => {
          this.router.navigate(['/applicant/dashboard']);
        });
      },
      error: (error) => {
        console.error(error);
        this.isSubmitting = false;

        const msg = error.error?.message || 'No se pudo crear la solicitud. Intenta nuevamente.';
        this.dialogService.error('Error', msg);
      }
    });
  }
}
