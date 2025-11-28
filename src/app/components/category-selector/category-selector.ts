import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CategoryService } from '../../services/category.service';
import { CategoryNode } from '../../models/category.model';

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './category-selector.html',
  styleUrls: ['./category-selector.css']
})
export class CategorySelectorComponent implements OnInit, OnDestroy {
  isOpen = false;
  allCategories: CategoryNode[] = [];
  selectedCategory: CategoryNode | null = null;
  searchTerm = '';
  filteredCategories: CategoryNode[] = [];
  currentPath: CategoryNode[] = [];
  currentLevel: CategoryNode[] = [];

  private destroy$ = new Subject<void>();

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getFullHierarchy(false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.allCategories = categories;
          this.filteredCategories = categories;
          this.currentLevel = categories;
        },
        error: (err) => {
          console.error('Error loading categories:', err);
          this.categoryService.categories$
            .pipe(takeUntil(this.destroy$))
            .subscribe(categories => {
              this.allCategories = categories;
              this.filteredCategories = categories;
              this.currentLevel = categories;
            });
        }
      });
  }

  openSelector() {
    this.isOpen = true;
    this.currentPath = [];
    this.currentLevel = this.allCategories;
    this.filteredCategories = this.allCategories;
    this.searchTerm = '';
  }

  closeSelector() {
    this.isOpen = false;
    this.searchTerm = '';
    this.currentPath = [];
    this.currentLevel = this.allCategories;
  }

  selectCategory(category: CategoryNode) {
    if (category.children && category.children.length > 0) {
      this.currentPath.push(category);
      this.currentLevel = category.children;
      this.filterCategories();
    } else {
      this.closeSelector();
    }
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
      this.filterCategories();
    }
  }

  filterCategories() {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = this.currentLevel;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredCategories = this.currentLevel.filter(cat =>
        cat.name.toLowerCase().includes(term) ||
        (cat.description && cat.description.toLowerCase().includes(term)) ||
        (cat.children && this.hasChildrenMatch(cat.children, term))
      );
    }
  }

  private hasChildrenMatch(children: CategoryNode[], term: string): boolean {
    return children.some(child =>
      child.name.toLowerCase().includes(term) ||
      (child.description && child.description.toLowerCase().includes(term)) ||
      (child.children && this.hasChildrenMatch(child.children, term))
    );
  }

  getCategoryIcon(category: CategoryNode): string {
    const iconMap: { [key: string]: string } = {
      'tecnologia': '💻',
      'construccion': '🏗️',
      'servicios-del-hogar': '🏠',
      'salud-y-bienestar': '⚕️',
      'educacion': '📚',
      'eventos': '🎉',
      'transporte': '🚗',
      'belleza': '💄',
      'deportes': '⚽',
      'mascotas': '🐾'
    };

    if (iconMap[category.slug]) {
      return iconMap[category.slug];
    }

    switch(category.level) {
      case 1:
        return '📂';
      case 2:
        return '🔧';
      case 3:
        return '⚡';
      default:
        return '📦';
    }
  }

  hasChildren(category: CategoryNode): boolean {
    return !!(category.children && category.children.length > 0);
  }

  /**
   * Obtener etiqueta descriptiva del nivel
   */
  getLevelLabel(level: number): string {
    switch(level) {
      case 1:
        return 'Categoría';
      case 2:
        return 'Área de trabajo';
      case 3:
        return 'Especialidad';
      default:
        return '';
    }
  }

  /**
   * Verificar si estamos en un nivel específico
   */
  isAtLevel(level: number): boolean {
    if (this.currentPath.length === 0) {
      return level === 1;
    }
    const currentCategory = this.currentPath[this.currentPath.length - 1];
    return currentCategory.level === level;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
