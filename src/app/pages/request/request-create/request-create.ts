import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategorySelectorRequest } from '../../../components/category-selector-request/category-selector-request';
import { RequestForm } from '../../../components/request-form/request-form';
import { CategoryNode } from '../../../models';
import { CategoryRequestInput, CreateRequestDTO } from '../../../models/request.models';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onBackToCategories(): void {
    this.currentStep = 1;
  }


  onCreateRequest(formData: any): void {
    if (this.selectedCategories.length === 0) {
      this.dialogService.warning(
        'Faltan datos',
        'Por favor selecciona al menos una categoría antes de continuar.'
      );
      return;
    }

    this.isSubmitting = true;

    const categoriesInput: CategoryRequestInput[] = this.selectedCategories.map(cat => ({
      categoryId: cat.id,
      level: cat.level,
      parentId: cat.parentId || undefined
    }));

    const payload: CreateRequestDTO = {
      title: formData.title,
      description: formData.description,
      urgency: formData.urgency,
      budget: formData.budget,
      dateNeeded: formData.dateNeeded,
      hourPreferred: formData.hourPreferred,
      address: formData.address,
      lat: formData.lat,
      lng: formData.lng,
      categories: categoriesInput
    };

    this.requestService.create(payload).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.dialogService.success(
          '¡Solicitud Publicada!',
          'Tu solicitud ha sido creada correctamente. Los profesionales te contactarán pronto.'
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
