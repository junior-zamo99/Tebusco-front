import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfessionalPublicService } from '../../services/professional-public.service';
import { CategoryService } from '../../services/category.service';
import { ProfessionalListItem } from '../../interface/professional-public.interface';
import { CategoryNode } from '../../models/category.model';

@Component({
  selector: 'app-professionals-by-category',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './professionals-by-category.html',
  styleUrl: './professionals-by-category.css',
})
export class ProfessionalsByCategory implements OnInit {
  categoryId!: number;
  category: CategoryNode | null = null;
  specialties: CategoryNode[] = [];
  selectedSpecialtyIds: number[] = [];

  professionals: ProfessionalListItem[] = [];
  loading = true;
  error: string | null = null;

  pagination = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private professionalService: ProfessionalPublicService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id'];
      this.loadCategoryData();
    });
  }

  loadCategoryData(): void {
    this.loading = true;

    // El servicio retorna directamente CategoryNode, no { success, data }
    this.categoryService.getCategoryById(this.categoryId, true).subscribe({
      next: (categoryData) => {
        this.category = categoryData;
        this.specialties = categoryData.children || [];
        this.loadProfessionals();
      },
      error: (err) => {
        console.error('Error loading category:', err);
        this.error = 'Error al cargar la categoría';
        this.loading = false;
      }
    });
  }

  loadProfessionals(): void {
    this.loading = true;
    this.error = null;

    if (this.selectedSpecialtyIds.length > 0) {
      this.professionalService.getProfessionalsByCategories(
        this.selectedSpecialtyIds,
        {
          page: this.pagination.page,
          limit: this.pagination.limit
        }
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.professionals = response.data.professionals;
            this.pagination = response.data.pagination;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading professionals:', err);
          this.error = 'Error al cargar los profesionales';
          this.loading = false;
        }
      });
    } else {
      this.professionalService.getProfessionalsByCategory(
        this.categoryId,
        {
          page: this.pagination.page,
          limit: this.pagination.limit
        }
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.professionals = response.data.professionals;
            this.pagination = response.data.pagination;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading professionals:', err);
          this.error = 'Error al cargar los profesionales';
          this.loading = false;
        }
      });
    }
  }

  toggleSpecialty(specialtyId: number): void {
    const index = this.selectedSpecialtyIds.indexOf(specialtyId);

    if (index > -1) {
      this.selectedSpecialtyIds.splice(index, 1);
    } else {
      this.selectedSpecialtyIds.push(specialtyId);
    }

    this.pagination.page = 1;
    this.loadProfessionals();
  }

  isSpecialtySelected(specialtyId: number): boolean {
    return this.selectedSpecialtyIds.includes(specialtyId);
  }

  clearFilters(): void {
    this.selectedSpecialtyIds = [];
    this.pagination.page = 1;
    this.loadProfessionals();
  }

  goToProfessional(professional: ProfessionalListItem): void {
    const categoryIds = this.selectedSpecialtyIds.length > 0
      ? this.selectedSpecialtyIds
      : [this.categoryId];

    this.router.navigate(['/professionals', professional.id], {
      queryParams: { categoryIds: categoryIds.join(',') }
    });
  }

  changePage(page: number): void {
    this.pagination.page = page;
    this.loadProfessionals();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getInitials(fullName: string): string {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/categories']);
  }
}
