import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileCategoryService, UpdateCategoryData } from '../../services/profile-category.service';
import { CategoryService } from '../../services/category.service';
import { CategoryNode } from '../../models/category.model';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-detail.component.html',
})
export class CategoryDetailComponent implements OnInit {
  categoryId: number | null = null;
  professionalId: number | null = null;

  categoryData: any = null;
  publicCategory: CategoryNode | null = null;

  loading = true;
  saving = false;
  error: string | null = null;

  selectedSpecialties: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileCategoryService: ProfileCategoryService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id'];

      const userData = this.storageService.getProfessional();
      if (userData && userData.id) {
        this.professionalId = userData.id;
        this.loadCategoryDetails();
      } else {
        this.error = 'No se pudo obtener el ID del profesional';
        this.loading = false;
      }
    });
  }

  loadCategoryDetails() {
    if (!this.professionalId || !this.categoryId) {
      this.error = 'Datos incompletos';
      this.loading = false;
      return;
    }

    this.profileCategoryService.getProfileCategoryById(this.professionalId, this.categoryId).subscribe({
      next: (res) => {
        if (res.success) {
          this.categoryData = res.data;

          // Initialize selected specialties
          if (this.categoryData.specialties) {
            this.categoryData.specialties.forEach((s: any) => this.selectedSpecialties.add(s.id));
          }

          // Get Public Category Data (for all specialties)
          this.categoryService.getCategoryById(this.categoryData.categoryId).subscribe({
            next: (catRes) => {
              this.publicCategory = catRes;
              this.loading = false;
            },
            error: (err) => {
              console.error('Error loading public category', err);
              this.loading = false;
            }
          });
        } else {
          this.error = res.message;
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Error al cargar los detalles de la categoría.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  toggleSpecialty(specialtyId: number) {
      if (this.selectedSpecialties.has(specialtyId)) {
          this.selectedSpecialties.delete(specialtyId);
      } else {
          this.selectedSpecialties.add(specialtyId);
      }
  }

  isSpecialtySelected(specialtyId: number): boolean {
      return this.selectedSpecialties.has(specialtyId);
  }

  save() {
    if (!this.professionalId || !this.categoryId) return;

    this.saving = true;
    const updateData: any = {
      description: this.categoryData.description,
      experience: this.categoryData.experience,
      priceMin: this.categoryData.priceMin,
      visible: this.categoryData.visible,
      specialtyIds: Array.from(this.selectedSpecialties)
    };

    this.profileCategoryService.updateProfileCategory(this.professionalId, this.categoryId, updateData).subscribe({
      next: (res) => {
        this.saving = false;
        this.router.navigate(['/profile-professional-personal'], { queryParams: { tab: 'categories' } });
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al guardar los cambios.';
        console.error(err);
      }
    });
  }

  cancel() {
      this.router.navigate(['/profile-professional-personal'], { queryParams: { tab: 'categories' } });
  }
}
