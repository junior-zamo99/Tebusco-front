import { Component, OnInit, OnDestroy, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { CategoryService } from '../../services/category.service';
import { ProfessionalService } from '../../services/professional.service';
import { ProfileCategoryService } from '../../services/profile-category.service';
import { DialogService } from '../../services/dialog.service';
import { CategoryNode } from '../../models';

interface SelectedSpecialty {
  id: number;
  name: string;
}

interface PendingCert {
  file: File;
  title: string;
}

@Component({
  selector: 'app-configure-category',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './configure-category.component.html',
  styleUrl: './configure-category.component.css'
})
export class ConfigureCategoryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);
  private professionalService = inject(ProfessionalService);
  private profileCategoryService = inject(ProfileCategoryService);
  private dialogService = inject(DialogService);

  professionalId: number | null = null;
  allCategories: CategoryNode[] = [];
  selectedMainCategory: CategoryNode | null = null;
  selectedArea: CategoryNode | null = null;
  availableSpecialties: CategoryNode[] = [];
  selectedSpecialties: SelectedSpecialty[] = [];

  description: string = '';
  slogan: string = '';
  experience: number = 0;
  priceMin: number = 0;

  pendingPhotoFiles: File[] = [];
  photoPreviewUrls: string[] = [];
  pendingCerts: PendingCert[] = [];
  pendingCertTitle = '';
  pendingCvFile: File | null = null;
  cvFileName: string = '';

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  step: 'category' | 'area' | 'config' = 'category';
  searchTerm = '';

  filteredCategories: CategoryNode[] = [];
  filteredAreas: CategoryNode[] = [];
  filteredSpecialties: CategoryNode[] = [];

  ngOnInit() {
    this.loadProfessionalData();
    this.loadCategories();
  }

  ngOnDestroy() {
    this.photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfessionalData() {
    this.professionalService.getMeComplete().subscribe({
      next: (response: any) => {
        console.log('Respuesta completa del backend:', response);
        if (response.success && response.data && response.data.professional) {
          this.professionalId = response.data.professional.id;
          console.log('ID Profesional cargado:', this.professionalId);
        } else {
          console.error('Estructura de respuesta inesperada:', response);
          this.dialogService.error('Error', 'No se pudo obtener el ID del profesional. Estructura incorrecta.');
        }
      },
      error: (error) => {
        console.error('Error al obtener datos del profesional:', error);
        this.dialogService.error('Error', 'No se pudo obtener la información del profesional');
      }
    });
  }

  private loadCategories() {
    this.isLoading = true;
    this.categoryService.getFullHierarchy(false).subscribe({
      next: (categories) => {
        this.allCategories = categories.filter(c => c.level === 1);
        this.filteredCategories = this.allCategories;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al cargar categorías';
        console.error('Error:', error);
      }
    });
  }

  selectMainCategory(category: CategoryNode) {
    this.selectedMainCategory = category;
    this.filteredAreas = category.children || [];
    this.searchTerm = '';
    this.step = 'area';
  }

  selectArea(area: CategoryNode) {
    this.selectedArea = area;
    this.availableSpecialties = area.children || [];
    this.filteredSpecialties = this.availableSpecialties;
    this.searchTerm = '';
    this.step = 'config';
  }

  toggleSpecialty(specialty: CategoryNode) {
    const index = this.selectedSpecialties.findIndex(s => s.id === specialty.id);

    if (index > -1) {
      this.selectedSpecialties.splice(index, 1);
    } else {
      this.selectedSpecialties.push({
        id: specialty.id,
        name: specialty.name
      });
    }
  }

  isSpecialtySelected(specialtyId: number): boolean {
    return this.selectedSpecialties.some(s => s.id === specialtyId);
  }

  removeSpecialty(specialtyId: number) {
    this.selectedSpecialties = this.selectedSpecialties.filter(s => s.id !== specialtyId);
  }

  filterCategories() {
    if (!this.searchTerm.trim()) {
      if (this.step === 'category') {
        this.filteredCategories = this.allCategories;
      } else if (this.step === 'area') {
        this.filteredAreas = this.selectedMainCategory?.children || [];
      } else if (this.step === 'config') {
        this.filteredSpecialties = this.availableSpecialties;
      }
    } else {
      const term = this.searchTerm.toLowerCase();
      if (this.step === 'category') {
        this.filteredCategories = this.allCategories.filter(cat =>
          cat.name.toLowerCase().includes(term)
        );
      } else if (this.step === 'area') {
        this.filteredAreas = (this.selectedMainCategory?.children || []).filter(cat =>
          cat.name.toLowerCase().includes(term)
        );
      } else if (this.step === 'config') {
        this.filteredSpecialties = this.availableSpecialties.filter(cat =>
          cat.name.toLowerCase().includes(term)
        );
      }
    }
  }

  goBack() {
    if (this.step === 'area') {
      this.selectedMainCategory = null;
      this.step = 'category';
      this.searchTerm = '';
      this.filteredCategories = this.allCategories;
    } else if (this.step === 'config') {
      this.selectedArea = null;
      this.step = 'area';
      this.searchTerm = '';
      this.filteredAreas = this.selectedMainCategory?.children || [];
    }
  }

  validateForm(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.description.trim()) {
      errors.push('La descripción es requerida');
    }

    if (this.description.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    if (this.experience < 0 || this.experience > 50) {
      errors.push('La experiencia debe estar entre 0 y 50 años');
    }

    if (this.priceMin < 0) {
      errors.push('El precio mínimo no puede ser negativo');
    }



    return {
      valid: errors.length === 0,
      errors
    };
  }

  onSave() {
    const validation = this.validateForm();

    if (!validation.valid) {
      this.dialogService.error('Formulario incompleto', validation.errors.join('. '));
      return;
    }

    if (!this.professionalId || !this.selectedArea) {
      this.dialogService.error('Error', 'Información incompleta (Falta ID profesional o Área)');
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const categoryData: any = {
      categoryId: this.selectedArea.id,
      level: 2 as 2,
      subcategories: this.selectedSpecialties.map(s => s.id),
      description: this.description,
      slogan: this.slogan || undefined,
      experience: this.experience,
      priceMin: this.priceMin,
    };

    this.profileCategoryService.saveMultipleCategories(this.professionalId, [categoryData])
      .pipe(
        takeUntil(this.destroy$),
        switchMap((response) => {
          const savedCategories: any[] = response.data?.categories || [];
          const savedCat = savedCategories.find(c => c.category?.id === this.selectedArea!.id);
          if (!savedCat) return of(null);

          const uploads: any[] = [];
          this.pendingPhotoFiles.forEach(file =>
            uploads.push(this.profileCategoryService.addPhoto(this.professionalId!, savedCat.id, file))
          );
          this.pendingCerts.forEach(cert =>
            uploads.push(this.profileCategoryService.addCertificate(this.professionalId!, savedCat.id, cert.file, cert.title))
          );
          if (this.pendingCvFile) {
            uploads.push(this.profileCategoryService.uploadCv(this.professionalId!, savedCat.id, this.pendingCvFile));
          }
          return uploads.length > 0 ? forkJoin(uploads) : of(null);
        })
      )
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.dialogService.success(
            '¡Categoría configurada!',
            'Tu nueva categoría ha sido guardada exitosamente'
          ).subscribe(() => {
            this.router.navigate(['/professional/dashboard']);
          });
        },
        error: (error) => {
          this.isSaving = false;
          this.errorMessage = error.error?.message || 'Error al guardar categoría';
          this.dialogService.error('Error', this.errorMessage);
          console.error('Error detallado:', error);
        }
      });
  }

  onPhotoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || this.pendingPhotoFiles.length >= 5) return;
    const file = input.files[0];
    this.pendingPhotoFiles.push(file);
    this.photoPreviewUrls.push(URL.createObjectURL(file));
    input.value = '';
  }

  removePhoto(index: number) {
    URL.revokeObjectURL(this.photoPreviewUrls[index]);
    this.pendingPhotoFiles.splice(index, 1);
    this.photoPreviewUrls.splice(index, 1);
  }

  onCertFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.pendingCertTitle.trim()) return;
    this.pendingCerts.push({ file: input.files[0], title: this.pendingCertTitle.trim() });
    this.pendingCertTitle = '';
    input.value = '';
  }

  removeCertificate(index: number) {
    this.pendingCerts.splice(index, 1);
  }

  onCvFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.pendingCvFile = input.files[0];
    this.cvFileName = input.files[0].name;
    input.value = '';
  }

  removeCv() {
    this.pendingCvFile = null;
    this.cvFileName = '';
  }

  onCancel() {
    this.dialogService.confirm(
      'Cancelar configuración',
      '¿Estás seguro que deseas cancelar? Se perderán los cambios.',
      'Sí, cancelar',
      'Continuar editando'
    ).subscribe((result) => {
      if (result.confirmed) {
        this.router.navigate(['/professional/dashboard']);
      }
    });
  }

  getCategoryIcon(category: CategoryNode): string {
    const iconMap: { [key: string]: string } = {
      'tecnologia': '💻',
      'construccion': '🏗️',
      'servicios-del-hogar': '🏠',
      'salud-y-bienestar': '⚕️',
      'educacion': '📚',
      'eventos': '🎉'
    };
    return iconMap[category.slug] || (category.level === 1 ? '📂' : category.level === 2 ? '🔧' : '⚡');
  }

  get progressPercentage(): number {
    if (this.step === 'category') return 33;
    if (this.step === 'area') return 66;
    return 100;
  }
}
