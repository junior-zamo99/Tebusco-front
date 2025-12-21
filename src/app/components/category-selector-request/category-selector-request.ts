import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CategoryService } from '../../services/category.service';
import { CategoryNode } from '../../models/category.model';

@Component({
  selector: 'app-category-selector-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-selector-request.html',
})
export class CategorySelectorRequest implements OnInit, OnDestroy {
  @Output() selectionConfirmed = new EventEmitter<CategoryNode[]>();

  isLoading = false;
  allCategories: CategoryNode[] = [];

  // Navegación
  currentPath: CategoryNode[] = [];
  currentLevel: CategoryNode[] = [];
  filteredCategories: CategoryNode[] = [];

  // Selección
  tempSelectedCategories: CategoryNode[] = [];
  searchTerm = '';

  private destroy$ = new Subject<void>();

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getFullHierarchy(false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.allCategories = categories;
          this.resetNavigation();
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
  }

  resetNavigation() {
    this.currentPath = [];
    this.currentLevel = this.allCategories;
    this.filteredCategories = this.allCategories;
    this.searchTerm = '';
  }

  handleCategoryClick(category: CategoryNode) {
    // Si tiene hijos y no estamos en nivel muy profundo, navegamos
    if (category.children && category.children.length > 0) {
      this.currentPath.push(category);
      this.currentLevel = category.children;
      this.searchTerm = '';
      this.filterCategories();
    } else {
      // Si es hoja, seleccionamos
      this.toggleSelection(category);
    }
  }

  toggleSelection(category: CategoryNode) {
    const index = this.tempSelectedCategories.findIndex(c => c.id === category.id);
    if (index > -1) {
      this.tempSelectedCategories.splice(index, 1);
    } else {
      this.tempSelectedCategories.push(category);
    }
  }

  isSelected(category: CategoryNode): boolean {
    return this.tempSelectedCategories.some(c => c.id === category.id);
  }

  goBack() {
    if (this.currentPath.length > 0) {
      this.currentPath.pop();
      if (this.currentPath.length === 0) {
        this.currentLevel = this.allCategories;
      } else {
        const parent = this.currentPath[this.currentPath.length - 1];
        this.currentLevel = parent.children || [];
      }
      this.searchTerm = '';
      this.filterCategories();
    }
  }

  confirm() {
    if (this.tempSelectedCategories.length > 0) {
      this.selectionConfirmed.emit(this.tempSelectedCategories);
    }
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

  getIcon(cat: CategoryNode): string {
    // Aquí puedes usar tu mapa de iconos
    return '📦';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
