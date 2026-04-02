import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { CategoryService } from '../../../services/category.service';
import { ProfileCategoryService, CategorySelectionData } from '../../../services/profile-category.service';
import { CategoryNode } from '../../../models';

interface PendingCert {
  file: File;
  title: string;
}

interface SelectedLevel2 {
  category: CategoryNode;
  selectedLevel3Ids: number[];
  // Configuración opcional
  description: string;
  slogan: string;
  experience: number | null;
  priceMin: number | null;
  // Fotos: archivo local + blob URL para preview
  pendingPhotoFiles: File[];
  photoPreviewUrls: string[];
  // Certificados: archivo local + título
  pendingCerts: PendingCert[];
  pendingCertTitle: string;
  // CV: archivo local
  pendingCvFile: File | null;
  cvFileName: string;
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

  allCategories: CategoryNode[] = [];
  currentPath: CategoryNode[] = [];
  currentLevel: CategoryNode[] = [];
  filteredCategories: CategoryNode[] = [];
  searchTerm = '';

  selectedLevel2Categories: Map<number, SelectedLevel2> = new Map();
  currentEditingLevel2: CategoryNode | null = null;

  viewStep: 'select' | 'configure' = 'select';

  isLoading = false;
  isSaving = false;
  errorMessage = '';

  professionalId: number | null = null;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private profileCategoryService: ProfileCategoryService,
  ) {}

  ngOnInit() {
    const storedId = localStorage.getItem('professionalId');
    if (storedId) this.professionalId = parseInt(storedId, 10);
    this.loadCategories();
  }

  ngOnDestroy() {
    this.selectedLevel2Categories.forEach(data => {
      data.photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    });
    this.destroy$.next();
    this.destroy$.complete();
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
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Error al cargar categorías. Intenta de nuevo.';
        }
      });
  }

  // ── Navegación ─────────────────────────────────────────────────────────────

  get currentLevelType(): 1 | 2 | 3 {
    if (this.currentPath.length === 0) return 1;
    return (this.currentPath[this.currentPath.length - 1].level + 1) as 1 | 2 | 3;
  }

  navigateToChildren(category: CategoryNode) {
    this.currentPath.push(category);
    this.currentLevel = category.children || [];
    this.filteredCategories = this.currentLevel;
    this.searchTerm = '';
    if (category.level === 2) this.currentEditingLevel2 = category;
  }

  goBack() {
    if (this.currentPath.length === 0) return;
    const removed = this.currentPath.pop();
    if (removed?.level === 2) this.currentEditingLevel2 = null;
    this.currentLevel = this.currentPath.length === 0
      ? this.allCategories
      : this.currentPath[this.currentPath.length - 1].children || [];
    this.filteredCategories = this.currentLevel;
    this.searchTerm = '';
  }

  goToRoot() {
    this.currentPath = [];
    this.currentLevel = this.allCategories;
    this.filteredCategories = this.allCategories;
    this.searchTerm = '';
    this.currentEditingLevel2 = null;
  }

  selectCategory(category: CategoryNode) {
    if (category.level === 1) {
      this.navigateToChildren(category);
    } else if (category.level === 2) {
      if (this.isLevel2Selected(category.id)) {
        this.navigateToChildren(category);
      } else {
        if (this.selectedLevel2Categories.size >= 2) {
          this.errorMessage = 'Inicialmente puedes configurar hasta 2 áreas. Desde tu dashboard podrás agregar más.';
          return;
        }
        this.selectedLevel2Categories.set(category.id, {
          category,
          selectedLevel3Ids: [],
          description: '',
          slogan: '',
          experience: null,
          priceMin: null,
          pendingPhotoFiles: [],
          photoPreviewUrls: [],
          pendingCerts: [],
          pendingCertTitle: '',
          pendingCvFile: null,
          cvFileName: '',
        });
        if (category.children && category.children.length > 0) this.navigateToChildren(category);
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
    const data = this.selectedLevel2Categories.get(categoryId);
    if (data) data.photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    this.selectedLevel2Categories.delete(categoryId);
  }

  isLevel2Selected(categoryId: number): boolean {
    return this.selectedLevel2Categories.has(categoryId);
  }

  isLevel3Selected(categoryId: number): boolean {
    if (!this.currentEditingLevel2) return false;
    return this.selectedLevel2Categories.get(this.currentEditingLevel2.id)?.selectedLevel3Ids.includes(categoryId) || false;
  }

  get selectedLevel2Count(): number {
    return this.selectedLevel2Categories.size;
  }

  getLevel3CountForLevel2(level2Id: number): number {
    return this.selectedLevel2Categories.get(level2Id)?.selectedLevel3Ids.length || 0;
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

  getSelectedLevel2Array(): SelectedLevel2[] {
    return Array.from(this.selectedLevel2Categories.values());
  }

  // ── Pasos ──────────────────────────────────────────────────────────────────

  goToConfigStep() {
    if (this.selectedLevel2Categories.size === 0) {
      this.errorMessage = 'Selecciona al menos un área de trabajo.';
      return;
    }
    this.errorMessage = '';
    this.viewStep = 'configure';
  }

  goBackToSelect() {
    this.viewStep = 'select';
  }

  // ── Fotos (locales hasta el save) ──────────────────────────────────────────

  onPhotoFileSelected(categoryId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const data = this.selectedLevel2Categories.get(categoryId);
    if (!data || data.pendingPhotoFiles.length >= 5) return;

    const file = input.files[0];
    data.pendingPhotoFiles.push(file);
    data.photoPreviewUrls.push(URL.createObjectURL(file));
    input.value = '';
  }

  removePhoto(categoryId: number, index: number) {
    const data = this.selectedLevel2Categories.get(categoryId);
    if (!data) return;
    URL.revokeObjectURL(data.photoPreviewUrls[index]);
    data.pendingPhotoFiles.splice(index, 1);
    data.photoPreviewUrls.splice(index, 1);
  }

  // ── Certificados (locales hasta el save) ───────────────────────────────────

  onCertFileSelected(categoryId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const data = this.selectedLevel2Categories.get(categoryId);
    if (!data || !data.pendingCertTitle.trim()) {
      this.errorMessage = 'Escribe el nombre del certificado antes de seleccionar el archivo.';
      input.value = '';
      return;
    }
    data.pendingCerts.push({ file: input.files[0], title: data.pendingCertTitle.trim() });
    data.pendingCertTitle = '';
    input.value = '';
  }

  removeCertificate(categoryId: number, index: number) {
    const data = this.selectedLevel2Categories.get(categoryId);
    if (!data) return;
    data.pendingCerts.splice(index, 1);
  }

  // ── CV (local hasta el save) ────────────────────────────────────────────────

  onCvFileSelected(categoryId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const data = this.selectedLevel2Categories.get(categoryId);
    if (!data) return;
    data.pendingCvFile = input.files[0];
    data.cvFileName = input.files[0].name;
    input.value = '';
  }

  removeCv(categoryId: number) {
    const data = this.selectedLevel2Categories.get(categoryId);
    if (!data) return;
    data.pendingCvFile = null;
    data.cvFileName = '';
  }

  // ── Guardar ────────────────────────────────────────────────────────────────

  onSave() {
    if (this.selectedLevel2Categories.size === 0) {
      alert('Debes seleccionar al menos un área de trabajo');
      return;
    }
    if (!this.professionalId) {
      this.errorMessage = 'ID del profesional no disponible';
      return;
    }

    // 1. Bulk save sin fotos ni certs (la API no los acepta en bulk)
    const categoriesData: CategorySelectionData[] = [];
    this.selectedLevel2Categories.forEach((value) => {
      const entry: CategorySelectionData = {
        categoryId: value.category.id,
        level: 2,
        subcategories: value.selectedLevel3Ids,
      };
      if (value.description) entry.description = value.description;
      if (value.slogan) entry.slogan = value.slogan;
      if (value.experience !== null) entry.experience = value.experience!;
      if (value.priceMin !== null) entry.priceMin = value.priceMin!;
      categoriesData.push(entry);
    });

    this.isSaving = true;
    this.errorMessage = '';

    this.profileCategoryService.saveMultipleCategories(this.professionalId, categoriesData)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((response) => {
          // 2. Con los IDs recién creados, subir fotos y certs
          const savedCategories: any[] = response.data?.categories || [];
          const uploads: any[] = [];

          this.selectedLevel2Categories.forEach((value) => {
            // La respuesta tiene category.id, no categoryId directo
            const savedCat = savedCategories.find(c => c.category?.id === value.category.id);
            if (!savedCat) return;

            value.pendingPhotoFiles.forEach(file => {
              uploads.push(
                this.profileCategoryService.addPhoto(this.professionalId!, savedCat.id, file)
              );
            });

            value.pendingCerts.forEach(cert => {
              uploads.push(
                this.profileCategoryService.addCertificate(this.professionalId!, savedCat.id, cert.file, cert.title)
              );
            });

            if (value.pendingCvFile) {
              uploads.push(
                this.profileCategoryService.uploadCv(this.professionalId!, savedCat.id, value.pendingCvFile)
              );
            }
          });

          return uploads.length > 0 ? forkJoin(uploads) : of(null);
        })
      )
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.router.navigate(['/professional/complete']);
        },
        error: (error) => {
          this.isSaving = false;
          this.errorMessage = error.error?.message || 'Error al guardar categorías';
        }
      });
  }

  onSkip() {
    if (confirm('¿Deseas configurar tus categorías más tarde? Podrás hacerlo desde tu perfil.')) {
      this.router.navigate(['/professional/dashboard']);
    }
  }

  onBack() {
    this.router.navigate(['/professional/upgrade']);
  }
}
