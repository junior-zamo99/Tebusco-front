import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileCategoryService, GroupedCategory } from '../../../services/profile-category.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface CategoryToConfig {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  experience: number | null;
  priceMin: number | null;
  isConfigured: boolean;
  specialties: Array<{
    id: number;
    categoryId: number;
    name: string;
    slug: string;
  }>;
}

@Component({
  selector: 'app-step-6-configure-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-6-configure-categories.html',
  styleUrl: './step-6-configure-categories.css'
})
export class Step6ConfigureCategories implements OnInit, OnDestroy {
  @Input() professionalData: any;
  @Input() savedCategoriesData: any;
  @Output() nextStep = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  groupedCategories: GroupedCategory[] = [];
  allCategoriesToConfig: CategoryToConfig[] = [];
  currentCategoryIndex = 0;
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;

  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private profileCategoryService: ProfileCategoryService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadSavedCategories();
  }

  private initializeForm() {
    this.form = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],
      experience: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      priceMin: ['', [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }


  private loadSavedCategories() {
    this.isLoading = true;

    this.profileCategoryService.getProfileCategoriesGrouped(this.professionalData.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.groupedCategories = response.data;
          this.buildConfigurationList();
          this.isLoading = false;

          if (this.allCategoriesToConfig.length > 0) {
            this.loadCurrentCategory();
          }
        },
        error: (error) => {
          this.error = 'Error al cargar las categorías guardadas';
          this.isLoading = false;
          console.error('Error:', error);
        }
      });
  }


  private buildConfigurationList() {
    this.allCategoriesToConfig = [];

    // Solo agregar áreas de trabajo (Level 2)
    this.groupedCategories.forEach(group => {
      this.allCategoriesToConfig.push({
        id: group.id,
        categoryId: group.category.id,
        name: group.category.name,
        slug: group.category.slug,
        description: group.description,
        experience: group.experience,
        priceMin: group.priceMin,
        isConfigured: this.isAlreadyConfigured(group),
        specialties: group.subcategories || []
      });
    });
  }

  private isAlreadyConfigured(category: any): boolean {
    return !!(
      category.description &&
      category.experience !== null &&
      category.priceMin !== null
    );
  }


  private loadCurrentCategory() {
    const current = this.currentCategory;
    if (current) {
      this.form.patchValue({
        description: current.description || '',
        experience: current.experience || '',
        priceMin: current.priceMin || '',
        isActive: true
      });
      this.successMessage = null;
    }
  }

  nextCategory() {
    if (this.currentCategoryIndex < this.allCategoriesToConfig.length - 1) {
      this.currentCategoryIndex++;
      this.loadCurrentCategory();
    }
  }

  previousCategory() {
    if (this.currentCategoryIndex > 0) {
      this.currentCategoryIndex--;
      this.loadCurrentCategory();
    }
  }

  skipToUnconfigured() {
    const nextUnconfigured = this.allCategoriesToConfig.findIndex(
      (cat, index) => index > this.currentCategoryIndex && !cat.isConfigured
    );

    if (nextUnconfigured !== -1) {
      this.currentCategoryIndex = nextUnconfigured;
      this.loadCurrentCategory();
    }
  }

  saveCurrentCategory() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.currentCategory) return;

    this.isSaving = true;
    this.error = null;

    const data = {
      description: this.form.get('description')?.value.trim(),
      experience: parseInt(this.form.get('experience')?.value),
      priceMin: parseFloat(this.form.get('priceMin')?.value),
      isActive: this.form.get('isActive')?.value
    };

    this.profileCategoryService.updateProfileCategory(
      this.professionalData.id,
      this.currentCategory.id,
      data
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allCategoriesToConfig[this.currentCategoryIndex].description = data.description;
          this.allCategoriesToConfig[this.currentCategoryIndex].experience = data.experience;
          this.allCategoriesToConfig[this.currentCategoryIndex].priceMin = data.priceMin;
          this.allCategoriesToConfig[this.currentCategoryIndex].isConfigured = true;

          this.isSaving = false;
          this.successMessage = `✅ ${this.currentCategory?.name} configurada correctamente`;

          setTimeout(() => {
            if (this.isLastCategory) {
              this.completeConfiguration();
            } else {
              this.nextCategory();
            }
          }, 1000);
        },
        error: (error) => {
          this.isSaving = false;
          this.error = error.error?.message || 'Error al actualizar la categoría';
        }
      });
  }


  private completeConfiguration() {
    this.isLoading = true;
    this.nextStep.emit({
      configured: true,
      totalConfigured: this.configuredCount
    });
  }

  onSkipAll() {
    if (confirm('¿Seguro que deseas saltar la configuración? Podrás hacerlo después desde tu perfil.')) {
      this.completeConfiguration();
    }
  }


  get currentCategory(): CategoryToConfig | null {
    return this.allCategoriesToConfig[this.currentCategoryIndex] || null;
  }

  get currentSpecialties(): Array<{id: number, categoryId: number, name: string, slug: string}> {
    return this.currentCategory?.specialties || [];
  }

  get totalCategories(): number {
    return this.allCategoriesToConfig.length;
  }

  get configuredCount(): number {
    return this.allCategoriesToConfig.filter(c => c.isConfigured).length;
  }

  get unconfiguredCount(): number {
    return this.totalCategories - this.configuredCount;
  }

  get isLastCategory(): boolean {
    return this.currentCategoryIndex === this.allCategoriesToConfig.length - 1;
  }

  get progress(): number {
    if (this.totalCategories === 0) return 0;
    return (this.configuredCount / this.totalCategories) * 100;
  }

  get currentProgress(): number {
    return ((this.currentCategoryIndex + 1) / this.totalCategories) * 100;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
