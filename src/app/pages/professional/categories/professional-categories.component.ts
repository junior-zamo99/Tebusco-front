import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CategoryService } from '../../../services/category.service';

import { ProfileCategoryService, CategorySelectionData } from '../../../services/profile-category.service';
import { SubscriptionService } from '../../../services/subscription.service';
import { CategoryNode } from '../../../models';

interface SelectedLevel2 {
  category: CategoryNode;
  selectedLevel3Ids: number[];
}

@Component({
  selector: 'app-professional-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professional-categories.component.html',
  styleUrl: './professional-categories.component.css'
})
export class ProfessionalCategoriesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Categorías
  allCategories: CategoryNode[] = [];
  currentPath: CategoryNode[] = [];
  currentLevel: CategoryNode[] = [];
  filteredCategories: CategoryNode[] = [];
  searchTerm = '';

  // Selecciones
  selectedLevel2Categories: Map<number, SelectedLevel2> = new Map();
  currentEditingLevel2: CategoryNode | null = null;

  // Estados
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  categoryLimit = 2; // Por defecto

  // Profesional data
  professionalId: number | null = null;
  subscriptionId: number | null = null;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private profileCategoryService: ProfileCategoryService,
    private subscriptionService: SubscriptionService
  ) {}

  ngOnInit() {
    this.loadProfessionalData();
    this.loadCategories();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private loadProfessionalData() {
    const storedProfessionalId = localStorage.getItem('professionalId');
    if (storedProfessionalId) {
      this.professionalId = parseInt(storedProfessionalId, 10);
    }

    const storedSubscriptionId = localStorage.getItem('subscriptionId');
    if (storedSubscriptionId) {
      this.subscriptionId = parseInt(storedSubscriptionId, 10);
      this.loadSubscriptionLimits();
    }
  }


  private loadSubscriptionLimits() {
    if (!this.subscriptionId) return;

    this.subscriptionService.getSubscriptionById(this.subscriptionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const subscription = response.data;

          const categoryFeature = subscription.plan?.intervals?.[0]?.features?.find(
            (f: any) => f.featureKey === 'categories'
          );

          if (categoryFeature) {
            this.categoryLimit = categoryFeature.isUnlimited ? 999 : (categoryFeature.limitValue || 2);
          }

          console.log('📊 Límite de categorías:', this.categoryLimit);
        },
        error: (error) => {
          console.error('Error al cargar límites:', error);
          this.categoryLimit = 2;
        }
      });
  }


  private loadCategories() {
    this.isLoading = true;

    this.categoryService.getFullHierarchy(false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.isLoading = false;
          this.allCategories = categories.filter(c => c.level === 1);
          this.currentLevel = this.allCategories;
          this.filteredCategories = this.allCategories;

          console.log('📂 Categorías cargadas:', this.allCategories.length);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al cargar categorías';
          console.error('Error:', error);
        }
      });
  }


  get currentLevelType(): 1 | 2 | 3 {
    if (this.currentPath.length === 0) return 1;
    const last = this.currentPath[this.currentPath.length - 1];
    return (last.level + 1) as 1 | 2 | 3;
  }

  navigateToChildren(category: CategoryNode) {
    this.currentPath.push(category);
    this.currentLevel = category.children || [];
    this.filteredCategories = this.currentLevel;
    this.searchTerm = '';

    if (category.level === 2) {
      this.currentEditingLevel2 = category;
    }
  }

  goBack() {
    if (this.currentPath.length > 0) {
      const removed = this.currentPath.pop();

      if (removed && removed.level === 2) {
        this.currentEditingLevel2 = null;
      }

      if (this.currentPath.length === 0) {
        this.currentLevel = this.allCategories;
      } else {
        const parent = this.currentPath[this.currentPath.length - 1];
        this.currentLevel = parent.children || [];
      }

      this.filteredCategories = this.currentLevel;
      this.searchTerm = '';
    }
  }

  selectCategory(category: CategoryNode) {
    if (category.level === 1) {
      this.navigateToChildren(category);
    } else if (category.level === 2) {
      if (this.isLevel2Selected(category.id)) {
        this.navigateToChildren(category);
      } else {
        if (!this.canAddMoreLevel2) {
          alert(`Has alcanzado el límite de ${this.categoryLimit} área(s) de trabajo`);
          return;
        }

        this.selectedLevel2Categories.set(category.id, {
          category: category,
          selectedLevel3Ids: []
        });

        if (category.children && category.children.length > 0) {
          this.navigateToChildren(category);
        }
      }
    } else if (category.level === 3) {
      this.toggleLevel3Category(category);
    }
  }

  toggleLevel3Category(category: CategoryNode) {
    if (!this.currentEditingLevel2) return;

    const level2Data = this.selectedLevel2Categories.get(this.currentEditingLevel2.id);
    if (!level2Data) return;

    const index = level2Data.selectedLevel3Ids.indexOf(category.id);

    if (index > -1) {
      level2Data.selectedLevel3Ids.splice(index, 1);
    } else {
      level2Data.selectedLevel3Ids.push(category.id);
    }
  }


  removeLevel2Category(categoryId: number, event: Event) {
    event.stopPropagation();
    this.selectedLevel2Categories.delete(categoryId);
  }


  isLevel2Selected(categoryId: number): boolean {
    return this.selectedLevel2Categories.has(categoryId);
  }

  isLevel3Selected(categoryId: number): boolean {
    if (!this.currentEditingLevel2) return false;
    const level2Data = this.selectedLevel2Categories.get(this.currentEditingLevel2.id);
    return level2Data?.selectedLevel3Ids.includes(categoryId) || false;
  }

  get canAddMoreLevel2(): boolean {
    return this.selectedLevel2Categories.size < this.categoryLimit;
  }

  get selectedLevel2Count(): number {
    return this.selectedLevel2Categories.size;
  }

  getLevel3CountForLevel2(level2Id: number): number {
    const level2Data = this.selectedLevel2Categories.get(level2Id);
    return level2Data?.selectedLevel3Ids.length || 0;
  }

  hasChildren(category: CategoryNode): boolean {
    return !!(category.children && category.children.length > 0);
  }


  filterCategories() {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = this.currentLevel;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredCategories = this.currentLevel.filter(cat =>
        cat.name.toLowerCase().includes(term) ||
        (cat.description && cat.description.toLowerCase().includes(term))
      );
    }
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

  getLevelBadgeColor(level: number): string {
    const colors = {
      1: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      3: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    };
    return colors[level as keyof typeof colors] || '';
  }

  getLevelLabel(level: number): string {
    const labels = { 1: 'Categoría', 2: 'Área de trabajo', 3: 'Especialidad' };
    return labels[level as keyof typeof labels] || '';
  }

  getSelectedLevel2Array(): SelectedLevel2[] {
    return Array.from(this.selectedLevel2Categories.values());
  }

  getCategoryNameById(id: number, categories: CategoryNode[] | undefined): string {
    if (!categories) return '';
    const found = categories.find(c => c.id === id);
    return found?.name || '';
  }


  onSave() {
    if (this.selectedLevel2Categories.size === 0) {
      alert('Debes seleccionar al menos un área de trabajo');
      return;
    }

    if (!this.professionalId) {
      this.errorMessage = 'ID del profesional no disponible';
      return;
    }

    const categoriesData: CategorySelectionData[] = [];

    this.selectedLevel2Categories.forEach((value) => {
      categoriesData.push({
        categoryId: value.category.id,
        level: 2,
        subcategories: value.selectedLevel3Ids
      });
    });

    this.isSaving = true;
    this.errorMessage = '';

    console.log('💾 Guardando categorías:', categoriesData);

    this.profileCategoryService.saveMultipleCategories(
      this.professionalId,
      categoriesData
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.isSaving = false;
        console.log('✅ Categorías guardadas:', response);

        alert('¡Categorías guardadas exitosamente! Tu perfil profesional está completo.');

        localStorage.removeItem('professionalId');
        localStorage.removeItem('subscriptionId');
        localStorage.removeItem('selectedPlanIntervalId');

        this.router.navigate(['/professional/category-success']);
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message || 'Error al guardar categorías';
        console.error('Error:', error);
        alert(this.errorMessage);
      }
    });
  }


  onSkip() {
    if (confirm('¿Deseas configurar tus categorías más tarde? Podrás hacerlo desde tu perfil.')) {
      localStorage.removeItem('professionalId');
      localStorage.removeItem('subscriptionId');
      localStorage.removeItem('selectedPlanIntervalId');

      this.router.navigate(['/professional/profile']);
    }
  }

  onBack() {
    this.router.navigate(['/professional/payment']);
  }
}
