import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { CategoryNode } from '../../models/category.model';

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
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadLevel1Categories();

    this.route.queryParams.subscribe(params => {
      const categoryId = params['id'];

      if (categoryId) {
        this.loadAndSelectCategory(+categoryId);
      } else {
        if (this.selectedCategory) {
          this.resetView(false);
        }
      }
    });
  }

  loadLevel1Categories(): void {
    if (this.categories.length === 0) {
      this.isLoading = true;
    }

    this.categoryService.getLevel1Categories(false).subscribe({
      next: (categories) => {
        this.categories = categories;
        if (!this.selectedCategory) {
          this.filteredCategories = categories;
        }
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
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { id: category.id },
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate(['/search'], {
        queryParams: { category: category.slug }
      });
    }
  }

  private loadAndSelectCategory(categoryId: number): void {
    if (this.selectedCategory?.id === categoryId) return;

    this.isLoadingChildren = true;

    this.categoryService.getCategoryById(categoryId, false).subscribe({
      next: (category) => {
        this.selectedCategory = category;
        this.updateBreadcrumb(category);

        this.categoryService.getSubcategories(categoryId, false).subscribe({
          next: (subcategories) => {
            this.filteredCategories = subcategories;
            this.searchTerm = '';
            this.isLoadingChildren = false;
          },
          error: (err) => {
            console.error('Error loading subcategories:', err);
            this.isLoadingChildren = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading category details:', err);
        this.isLoadingChildren = false;
        this.router.navigate([], { relativeTo: this.route, queryParams: { id: null } });
      }
    });
  }

  filterCategories(): void {
    const listToFilter = this.selectedCategory
      ? this.filteredCategories
      : this.categories;

    if (!this.searchTerm.trim()) {
      if (this.selectedCategory) {
        this.loadAndSelectCategory(this.selectedCategory.id);
      } else {
        this.filteredCategories = this.categories;
      }
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();

    this.filteredCategories = listToFilter.filter(cat =>
      cat.name.toLowerCase().includes(searchLower) ||
      (cat.description && cat.description.toLowerCase().includes(searchLower))
    );
  }

  resetView(navigate: boolean = true): void {
    this.selectedCategory = null;
    this.breadcrumb = [];
    this.filteredCategories = this.categories;
    this.searchTerm = '';

    if (navigate) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { id: null }
      });
    }
  }

  navigateToBreadcrumb(category: CategoryNode): void {
    const index = this.breadcrumb.findIndex(c => c.id === category.id);
    if (index !== -1) {
      this.breadcrumb = this.breadcrumb.slice(0, index + 1);
    }

    this.selectCategory(category);
  }

  goBack(): void {
    if (!this.selectedCategory) return;

    if (this.breadcrumb.length > 1) {
      const parent = this.breadcrumb[this.breadcrumb.length - 2];

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { id: parent.id }
      });
    } else {
      this.resetView();
    }
  }

  private updateBreadcrumb(category: CategoryNode): void {
    const exists = this.breadcrumb.find(b => b.id === category.id);
    if (!exists) {
      if (category.parentId === null) {
        this.breadcrumb = [category];
      } else {
        this.breadcrumb.push(category);
      }
    }
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
}
