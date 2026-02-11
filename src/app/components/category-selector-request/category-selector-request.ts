import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
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

  // Estado de navegación
  currentPath: CategoryNode[] = [];    // Historial (Breadcrumbs)
  currentLevel: CategoryNode[] = [];   // Datos crudos del nivel actual
  filteredCategories: CategoryNode[] = []; // Datos filtrados por el buscador

  // Selección
  tempSelectedCategories: CategoryNode[] = [];
  searchTerm = '';

  // Configuración de Profundidad
  // 0 = Nivel 1 (Raíz) -> Solo navegación
  // 1 = Nivel 2 -> Selección Única (Radio) + Navegación
  // 2 = Nivel 3 -> Selección Múltiple (Checkbox)
  readonly MAX_NAV_DEPTH = 2;

  private destroy$ = new Subject<void>();

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadLevel1();
  }

  /**
   * Carga inicial: Obtiene solo las categorías principales (Nivel 1)
   */
  loadLevel1() {
    this.isLoading = true;
    this.categoryService.getLevel1Categories(false)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (categories) => {
          this.currentLevel = categories;
          this.currentPath = [];
          this.filterCategories();
        },
        error: (err) => console.error('Error cargando categorías:', err)
      });
  }

  /**
   * Acción: NAVEGAR (Click en la tarjeta)
   * Intenta profundizar en la categoría.
   */
  handleNavigation(category: CategoryNode) {
    // Si ya llegamos a la profundidad máxima, el click en la tarjeta actúa como selección
    if (!this.canNavigateDeeper()) {
      this.toggleSelection(category);
      return;
    }

    this.isLoading = true;
    this.categoryService.getSubcategories(category.id, false)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (subcategories) => {
          if (subcategories && subcategories.length > 0) {
            // SI hay hijos: Entramos al nivel
            this.currentPath.push(category);
            this.currentLevel = subcategories;
            this.searchTerm = '';
            this.filterCategories();
          } else {
            // NO hay hijos: Se comporta como selección
            this.toggleSelection(category);
          }
        },
        error: () => this.toggleSelection(category)
      });
  }

  /**
   * Acción: SELECCIONAR (Click en el selector)
   * Lógica diferenciada por nivel.
   */
  toggleSelection(category: CategoryNode) {
    const currentDepth = this.currentPath.length;

    // --- LÓGICA NIVEL 2: SELECCIÓN ÚNICA (Radio Button) ---
    if (currentDepth === 1) {
      if (this.isSelected(category)) {
        // Opción: Permitir deseleccionar si se hace click de nuevo
        this.tempSelectedCategories = [];
      } else {
        // Reemplazamos cualquier selección anterior. Solo 1 permitida.
        this.tempSelectedCategories = [category];
      }
    }

    // --- LÓGICA NIVEL 3+: SELECCIÓN MÚLTIPLE (Checkbox) ---
    else {
      // (Opcional) Limpieza: Si el usuario había seleccionado el Padre (Nivel 2)
      // y ahora selecciona un Hijo (Nivel 3), quitamos al padre para evitar redundancia.
      const parent = this.currentPath[this.currentPath.length - 1];
      const parentIndex = this.tempSelectedCategories.findIndex(c => c.id === parent.id);
      if (parentIndex > -1) {
        this.tempSelectedCategories.splice(parentIndex, 1);
      }

      // Lógica estándar de toggle
      const index = this.tempSelectedCategories.findIndex(c => c.id === category.id);
      if (index > -1) {
        this.tempSelectedCategories.splice(index, 1);
      } else {
        this.tempSelectedCategories.push(category);
      }
    }
  }

  /**
   * Botón Atrás
   */
  goBack() {
    if (this.currentPath.length > 0) {
      this.currentPath.pop();

      if (this.currentPath.length === 0) {
        this.loadLevel1();
      } else {
        const parent = this.currentPath[this.currentPath.length - 1];
        this.loadSubcategoriesForParent(parent);
      }
      this.searchTerm = '';
    }
  }

  private loadSubcategoriesForParent(parent: CategoryNode) {
    this.isLoading = true;
    this.categoryService.getSubcategories(parent.id, false)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe(subcategories => {
        this.currentLevel = subcategories;
        this.filterCategories();
      });
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

  // --- Helpers ---

  isSelected(category: CategoryNode): boolean {
    return this.tempSelectedCategories.some(c => c.id === category.id);
  }

  canNavigateDeeper(): boolean {
    return this.currentPath.length < this.MAX_NAV_DEPTH;
  }

  getIcon(cat: CategoryNode): string {
    return '📦';
  }

  resetNavigation() {
    this.searchTerm = '';
    this.tempSelectedCategories = []; // Opcional: limpiar selección al reiniciar
    this.loadLevel1();
  }

  confirm() {
    if (this.tempSelectedCategories.length > 0) {
      this.selectionConfirmed.emit(this.tempSelectedCategories);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
