import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileCategoryService } from '../../services/profile-category.service';
import { CategoryService } from '../../services/category.service';
import { CategoryNode } from '../../models/category.model';
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

          // 1. Limpiamos selección previa
          this.selectedSpecialties.clear();

          // 2. Lógica corregida para leer tu JSON actual
          if (this.categoryData.specialties && Array.isArray(this.categoryData.specialties)) {
            this.categoryData.specialties.forEach((s: any) => {

              // TU JSON USA "categoryId" PARA IDENTIFICAR LA ESPECIALIDAD
              // Probamos en este orden de prioridad:

              let idToAdd = null;

              if (s.categoryId) {
                 // Caso actual según tu JSON: { id: 295, categoryId: 11, ... }
                 idToAdd = s.categoryId;
              } else if (s.specialty && s.specialty.id) {
                 // Caso objeto anidado: { specialty: { id: 11 } }
                 idToAdd = s.specialty.id;
              } else if (s.specialtyId) {
                 // Caso columna plana: { specialtyId: 11 }
                 idToAdd = s.specialtyId;
              }

              // Si encontramos un ID válido, lo agregamos al Set visual
              if (idToAdd) {
                this.selectedSpecialties.add(idToAdd);
              }
            });
          }

          console.log('Especialidades cargadas visualmente:', this.selectedSpecialties);

          // 3. Cargar las opciones públicas (Checkboxes)
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
          this.error = res.message || 'Error al obtener datos.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.error = 'Error de conexión al cargar los detalles.';
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

    const availableSpecialtyIds = this.publicCategory?.children?.map(child => child.id) || [];

    const specialtyIdsArray = Array.from(this.selectedSpecialties)
        .filter(id => availableSpecialtyIds.includes(id));

    const updateData: any = {
      slogan: this.categoryData.slogan,
      description: this.categoryData.description,
      experience: this.categoryData.experience,
      priceMin: this.categoryData.priceMin,
      visible: this.categoryData.visible,
      specialtyIds: specialtyIdsArray
    };

    console.log('IDs disponibles (UI):', availableSpecialtyIds);
    console.log('Enviando datos limpios:', updateData);

    this.profileCategoryService.updateProfileCategory(this.professionalId, this.categoryId, updateData).subscribe({
      next: (res) => {
        this.saving = false;
        this.router.navigate(['/profile-professional-personal'], { queryParams: { tab: 'categories' } });
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Error al guardar los cambios. Intente nuevamente.';
        console.error('Error en update:', err);
      }
    });
  }

  cancel() {
      this.router.navigate(['/profile-professional-personal'], { queryParams: { tab: 'categories' } });
  }
}
