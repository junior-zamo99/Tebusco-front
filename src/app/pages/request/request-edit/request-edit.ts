import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CategorySelectorRequest } from '../../../components/category-selector-request/category-selector-request';
import { RequestForm } from '../../../components/request-form/request-form';
import { CategoryNode } from '../../../models/category.model';
import { RequestCategoryInput, UpdateRequestDTO } from '../../../models/request.models';
import { RequestService } from '../../../services/request.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-request-edit',
  standalone: true,
  imports: [CommonModule, CategorySelectorRequest, RequestForm],
  templateUrl: './request-edit.html',
})
export class RequestEdit implements OnInit {

  currentStep: 1 | 2 = 2;
  selectedCategories: CategoryNode[] = [];
  requestData: any = null;
  requestId: number | null = null;
  isLoading = true;
  isSubmitting = false;

  constructor(
    private requestService: RequestService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || isNaN(Number(id))) {
      this.router.navigate(['/applicant/requests']);
      return;
    }

    this.requestId = Number(id);
    this.loadRequest(this.requestId);
  }

  loadRequest(id: number): void {
    this.isLoading = true;
    this.requestService.getById(id).subscribe({
      next: (response: any) => {
        const data = response.data ?? response;

        if (data.totalOffers && data.totalOffers > 0) {
          this.dialogService.error(
            'No se puede editar',
            `Esta solicitud ya tiene ${data.totalOffers} oferta(s) activa(s). No es posible editarla hasta que todas las ofertas sean canceladas o rechazadas.`
          ).subscribe(() => {
            this.router.navigate(['/applicant/request', id]);
          });
          return;
        }

        this.requestData = data;

        // Pre-cargar las categorías seleccionadas
        if (data.categories && Array.isArray(data.categories)) {
          this.selectedCategories = data.categories.map((cat: any) => ({
            id: cat.categoryId,
            name: cat.name,
            slug: cat.slug,
            level: cat.level ?? 1,
            parentId: cat.parentId ?? null,
            imageUrl: cat.imageUrl ?? null,
            hasChildren: false,
            children: []
          }));
        }

        this.isLoading = false;
      },
      error: () => {
        this.dialogService.error('Error', 'No se pudo cargar la solicitud.').subscribe(() => {
          this.router.navigate(['/applicant/requests']);
        });
      }
    });
  }

  onCategoriesConfirmed(categories: CategoryNode[]): void {
    this.selectedCategories = categories;
    this.currentStep = 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onBackToCategories(): void {
    this.currentStep = 1;
  }

  onUpdateRequest(formData: any): void {
    if (!this.requestId || this.selectedCategories.length === 0) {
      this.dialogService.warning('Faltan datos', 'Por favor selecciona al menos una categoría.');
      return;
    }

    this.isSubmitting = true;

    const categoriesInput: RequestCategoryInput[] = this.selectedCategories.map(cat => ({
      categoryId: cat.id,
      level: cat.level,
      parentId: cat.parentId ?? null
    }));

    const payload: UpdateRequestDTO = {
      title: formData.title,
      description: formData.description,
      urgency: formData.urgency,
      budget: formData.budget,
      dateNeeded: formData.dateNeeded,
      hourPreferred: formData.hourPreferred,
      cityId: formData.cityId,
      address: formData.address,
      categories: categoriesInput,
    };

    this.requestService.update(this.requestId, payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        const updatedId = response.data?.id ?? this.requestId;
        this.dialogService.success(
          '¡Solicitud Actualizada!',
          'Los cambios se han guardado correctamente.'
        ).subscribe(() => {
          this.router.navigate(['/applicant/request', updatedId]);
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        const msg = error.error?.message || 'No se pudo actualizar la solicitud. Intenta nuevamente.';
        this.dialogService.error('Error', msg);
      }
    });
  }
}
