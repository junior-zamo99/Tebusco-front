// categories.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { CategoryNode } from '../../models/category.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: CategoryNode[] = [];
  filteredCategories: CategoryNode[] = [];
  searchTerm: string = '';
  selectedCategory: CategoryNode | null = null;
  breadcrumb: CategoryNode[] = [];
  viewMode: 'grid' | 'list' = 'grid';

  isLoading: boolean = true;
  isLoadingChildren: boolean = false;

  private categoryIcons: { [key: string]: string } = {
    'tecnologia': '💻',
    'construccion': '🏗️',
    'servicios-del-hogar': '🏠',
    'salud-y-bienestar': '⚕️',
    'educacion': '📚',
    'eventos': '🎉',
    'transporte-logistica': '🚚',
    'finanzas-contabilidad': '💼',
    'marketing-publicidad': '📢',
    'asesorias-legales': '⚖️',
    'belleza-estetica': '💄',
    'gastronomia-catering': '🍽️',
  };

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLevel1Categories();

    // Manejo de navegación con categoría preseleccionada
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['selectedCategoryId']) {
      const categoryId = navigation.extras.state['selectedCategoryId'];
      setTimeout(() => this.loadAndSelectCategory(categoryId), 100);
    }
  }


  loadLevel1Categories(): void {
    this.isLoading = true;

    this.categoryService.getLevel1Categories(false).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filteredCategories = categories;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading level 1 categories:', err);
        this.isLoading = false;
      }
    });
  }


  selectCategory(category: CategoryNode): void {
    if (category.level === 2) {
      this.router.navigate(['/professionals/category', category.id]);
      return;
    }

    if (category.childrenCount && category.childrenCount > 0) {
      this.loadSubcategories(category);
    } else {
      this.router.navigate(['/search'], {
        queryParams: { category: category.slug }
      });
    }
  }


  private loadSubcategories(category: CategoryNode): void {
    this.isLoadingChildren = true;

    this.categoryService.getSubcategories(category.id, false).subscribe({
      next: (subcategories) => {
        // Actualizar navegación
        this.selectedCategory = category;
        this.breadcrumb.push(category);
        this.filteredCategories = subcategories;
        this.searchTerm = '';
        this.isLoadingChildren = false;
      },
      error: (err) => {
        console.error('Error loading subcategories:', err);
        this.isLoadingChildren = false;
      }
    });
  }


  private loadAndSelectCategory(categoryId: number): void {
    // Primero obtenemos la categoría padre para tener sus datos (nombre, etc)
    this.categoryService.getCategoryById(categoryId, false).subscribe({
      next: (category) => {
        this.selectedCategory = category;
        this.breadcrumb.push(category);

        // Luego cargamos sus subcategorías usando el servicio específico
        this.isLoadingChildren = true;
        this.categoryService.getSubcategories(categoryId, false).subscribe({
          next: (subcategories) => {
            this.filteredCategories = subcategories;
            this.isLoadingChildren = false;
          },
          error: (err) => {
            console.error('Error loading subcategories:', err);
            this.isLoadingChildren = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading category:', err);
      }
    });
  }


  filterCategories(): void {
    if (!this.searchTerm.trim()) {
      // Sin búsqueda, mostrar todas las actuales
      this.filteredCategories = this.selectedCategory
        ? this.selectedCategory.children || []
        : this.categories;
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    const currentCategories = this.selectedCategory?.children || this.categories;

    this.filteredCategories = currentCategories.filter(cat =>
      cat.name.toLowerCase().includes(searchLower) ||
      cat.description.toLowerCase().includes(searchLower)
    );
  }


  goBack(): void {
    if (this.breadcrumb.length === 0) return;

    this.breadcrumb.pop();

    if (this.breadcrumb.length === 0) {
      // Volver a nivel 1
      this.selectedCategory = null;
      this.loadLevel1Categories();
    } else {
      // Volver al nivel anterior
      const parent = this.breadcrumb[this.breadcrumb.length - 1];
      this.selectedCategory = parent;

      // Recargar subcategorías del padre
      this.isLoadingChildren = true;
      this.categoryService.getSubcategories(parent.id, false).subscribe({
        next: (subcategories) => {
          this.filteredCategories = subcategories;
          this.isLoadingChildren = false;
        },
        error: (err) => {
          console.error('Error reloading subcategories:', err);
          this.isLoadingChildren = false;
        }
      });
    }

    this.searchTerm = '';
  }

me(): void {
    this.selectedCategory = null;
    this.breadcrumb = [];
    this.searchTerm = '';
    this.loadLevel1Categories();
  }

  getCategoryIcon(category: CategoryNode): string {
    return this.categoryIcons[category.slug] || '📋';
  }

  hasChildren(category: CategoryNode): boolean {
    return (category.childrenCount && category.childrenCount > 0) || false;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  getTopCategories(): CategoryNode[] {
    return this.filteredCategories.filter(cat => cat.isTop);
  }

  getOtherCategories(): CategoryNode[] {
    return this.filteredCategories.filter(cat => !cat.isTop);
  }
}
