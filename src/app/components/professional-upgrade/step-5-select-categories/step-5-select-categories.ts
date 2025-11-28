import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { ProfileCategoryService, CategorySelectionData } from '../../../services/profile-category.service';
import { CategoryNode } from '../../../models/category.model';
import { Plan } from '../../../models/plan.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface SelectedLevel2 {
  category: CategoryNode;
  selectedLevel3Ids: number[];
}

@Component({
  selector: 'app-step-5-select-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-5-select-categories.html',
  styleUrl: './step-5-select-categories.css'
})
export class Step5SelectCategories implements OnInit, OnDestroy {
  @Input() professionalData: any;
  @Input() selectedPlan: Plan | null = null;
  @Output() nextStep = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();


  allCategories: CategoryNode[] = [];
  currentPath: CategoryNode[] = [];
  currentLevel: CategoryNode[] = [];
  filteredCategories: CategoryNode[] = [];
  searchTerm = '';


  selectedLevel2Categories: Map<number, SelectedLevel2> = new Map();
  currentEditingLevel2: CategoryNode | null = null;


  isLoading = false;
  isLoadingCategories = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private profileCategoryService: ProfileCategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }


  private loadCategories() {
    this.isLoadingCategories = true;
    this.categoryService.getFullHierarchy(false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.allCategories = categories.filter(c => c.level === 1);
          this.currentLevel = this.allCategories;
          this.filteredCategories = this.allCategories;
          this.isLoadingCategories = false;
        },
        error: (error) => {
          this.isLoadingCategories = false;
          this.error = 'Error al cargar categorías: ' + (error.error?.message || error.message);
        }
      });
  }


  get categoryLimit(): number {
    if (!this.selectedPlan) return 0;
    const feature = this.selectedPlan.features.find(
      f => f.featureName.toLowerCase() === 'categorias'
    );
    return feature?.limit || 1;
  }

  get selectedLevel2Count(): number {
    return this.selectedLevel2Categories.size;
  }

  get canAddMoreLevel2(): boolean {
    return this.selectedLevel2Count < this.categoryLimit;
  }

  get currentLevelType(): 1 | 2 | 3 {
    if (this.currentPath.length === 0) return 1;
    const last = this.currentPath[this.currentPath.length - 1];
    return (last.level + 1) as 1 | 2 | 3;
  }

  selectCategory(category: CategoryNode) {
    if (category.level === 1) {
      this.navigateToLevel2(category);
    } else if (category.level === 2) {
      if (this.isLevel2Selected(category.id)) {
        this.editLevel2Subcategories(category);
      } else {
        this.selectLevel2Category(category);
      }
    } else if (category.level === 3) {
      this.toggleLevel3Category(category);
    }
  }

  navigateToLevel2(level1Category: CategoryNode) {
    this.currentPath = [level1Category];
    this.currentLevel = level1Category.children || [];
    this.filteredCategories = this.currentLevel;
  }

  editLevel2Subcategories(level2Category: CategoryNode) {
    this.currentPath.push(level2Category);
    this.currentLevel = level2Category.children || [];
    this.filteredCategories = this.currentLevel;
    this.currentEditingLevel2 = level2Category;
  }

  goBack() {
    if (this.currentPath.length > 0) {
      this.currentPath.pop();

      if (this.currentPath.length === 0) {
        this.currentLevel = this.allCategories;
        this.currentEditingLevel2 = null;
      } else {
        const parent = this.currentPath[this.currentPath.length - 1];
        this.currentLevel = parent.children || [];

        if (parent.level === 1) {
          this.currentEditingLevel2 = null;
        }
      }

      this.filterCategories();
    }
  }

  selectLevel2Category(category: CategoryNode) {
    if (!this.canAddMoreLevel2) {
      alert(`Has alcanzado el límite de ${this.categoryLimit} área(s) de trabajo de tu plan`);
      return;
    }

    this.selectedLevel2Categories.set(category.id, {
      category: category,
      selectedLevel3Ids: []
    });

    this.editLevel2Subcategories(category);
  }

  removeLevel2Category(categoryId: number) {
    this.selectedLevel2Categories.delete(categoryId);
  }

  isLevel2Selected(categoryId: number): boolean {
    return this.selectedLevel2Categories.has(categoryId);
  }


  toggleLevel3Category(category: CategoryNode) {
    if (!this.currentEditingLevel2) return;

    const level2Id = this.currentEditingLevel2.id;
    const level2Data = this.selectedLevel2Categories.get(level2Id);

    if (!level2Data) return;

    const index = level2Data.selectedLevel3Ids.indexOf(category.id);

    if (index > -1) {
      level2Data.selectedLevel3Ids.splice(index, 1);
    } else {
      level2Data.selectedLevel3Ids.push(category.id);
    }
  }

  isLevel3Selected(categoryId: number): boolean {
    if (!this.currentEditingLevel2) return false;

    const level2Data = this.selectedLevel2Categories.get(this.currentEditingLevel2.id);
    return level2Data?.selectedLevel3Ids.includes(categoryId) || false;
  }

  getLevel3CountForLevel2(level2Id: number): number {
    const level2Data = this.selectedLevel2Categories.get(level2Id);
    return level2Data?.selectedLevel3Ids.length || 0;
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

    if (iconMap[category.slug]) {
      return iconMap[category.slug];
    }

    switch(category.level) {
      case 1: return '📂';
      case 2: return '🔧';
      case 3: return '⚡';
      default: return '📦';
    }
  }

  getLevelBadgeColor(level: number): string {
    switch(level) {
      case 1: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 2: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 3: return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }

  getLevelLabel(level: number): string {
    switch(level) {
      case 1: return 'Categoría';
      case 2: return 'Área de trabajo';
      case 3: return 'Especialidad';
      default: return '';
    }
  }

  hasChildren(category: CategoryNode): boolean {
    return !!(category.children && category.children.length > 0);
  }

  getSelectedLevel2Array(): SelectedLevel2[] {
    return Array.from(this.selectedLevel2Categories.values());
  }

  onNext() {
    if (this.selectedLevel2Categories.size === 0) {
      alert('Debes seleccionar al menos un área de trabajo');
      return;
    }

    const categoriesData: CategorySelectionData[] = [];

    this.selectedLevel2Categories.forEach((value, key) => {
      categoriesData.push({
        categoryId: value.category.id,
        level: 2,
        subcategories: value.selectedLevel3Ids
      });
    });

    this.isLoading = true;
    this.error = null;

    this.profileCategoryService.saveMultipleCategories(
      this.professionalData.id,
      categoriesData
    ).subscribe({
      next: (response) => {
        console.log('✅ Categorías guardadas:', response);
        this.nextStep.emit({
          categories: response.data,
          level2Count: response.data.totalLevel2,
          level3Count: response.data.totalLevel3
        });
      },
      error: (error) => {
        console.error('❌ Error al guardar:', error);
        this.error = error.error?.message || 'Error al guardar las categorías';
        this.isLoading = false;
        alert(this.error);
      }
    });
  }

  onBack() {
    this.back.emit();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCategoryNameById(id: number, categories: CategoryNode[] | undefined): string {
  if (!categories) return '';
  const found = categories.find(c => c.id === id);
  return found?.name || '';
}
}
