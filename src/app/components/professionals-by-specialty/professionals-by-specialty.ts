import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfessionalPublicService } from '../../services/professional-public.service';
import { CategoryService } from '../../services/category.service';
import { ProfessionalListItem } from '../../interface/professional-public.interface';
import { CategoryNode } from '../../models/category.model';

@Component({
  selector: 'app-professionals-by-specialty',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './professionals-by-specialty.html',
  styleUrl: './professionals-by-specialty.css',
})
export class ProfessionalsBySpecialty implements OnInit {
  specialtyId!: number;
  specialty: CategoryNode | null = null;
  parentCategory: CategoryNode | null = null;

  professionals: ProfessionalListItem[] = [];
  loading = true;
  error: string | null = null;

  pagination = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  };

  // Filtros internos (aunque no se muestren en el HTML, se mantienen por si acaso)
  filters = {
    city: '',
    minRating: undefined as number | undefined,
    isVerified: undefined as boolean | undefined,
    isPremium: undefined as boolean | undefined,
    sortBy: 'rating' as 'rating' | 'price' | 'reviews' | 'created' | undefined,
    sortOrder: 'desc' as 'asc' | 'desc'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private professionalService: ProfessionalPublicService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.specialtyId = +params['id'];
      this.loadSpecialtyData();
    });
  }

  loadSpecialtyData(): void {
    this.loading = true;

    this.categoryService.getCategoryById(this.specialtyId, false).subscribe({
      next: (specialtyData) => {
        this.specialty = specialtyData;

        if (specialtyData.parentId) {
          this.categoryService.getCategoryById(specialtyData.parentId, false).subscribe({
            next: (parent) => {
              this.parentCategory = parent;
            },
            error: (err) => {
              console.error('Error loading parent category:', err);
            }
          });
        }

        this.loadProfessionals();
      },
      error: (err) => {
        console.error('Error loading specialty:', err);
        this.error = 'Error al cargar la especialidad';
        this.loading = false;
      }
    });
  }

  loadProfessionals(): void {
    this.loading = true;
    this.error = null;

    const query = {
      page: this.pagination.page,
      limit: this.pagination.limit,
      ...this.filters
    };

    this.professionalService.getProfessionalsBySpecialty(
      this.specialtyId,
      query
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.professionals = response.data.professionals;
          this.pagination = response.data.pagination;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading professionals by specialty:', err);
        this.error = 'Error al cargar los profesionales';
        this.loading = false;
      }
    });
  }

  goToProfessional(professional: ProfessionalListItem): void {
    this.router.navigate(['/professionals', professional.id], {
      queryParams: { categoryIds: this.specialtyId }
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
    if (this.parentCategory) {
      this.router.navigate(['/professionals/category', this.parentCategory.id]);
    } else {
      this.router.navigate(['/categories']);
    }
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    const currentPage = this.pagination.page;
    const totalPages = this.pagination.totalPages;

    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
