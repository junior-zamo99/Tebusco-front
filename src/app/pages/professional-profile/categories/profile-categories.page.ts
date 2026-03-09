import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfessionalService } from '../../../services/professional.service';
import { ProfessionalCompleteData } from '../../../models/professional-complete.model';
import { ProfileCategoriesComponent } from '../../../components/profile-categories-component/profile-categories-component';

@Component({
  selector: 'app-profile-categories-page',
  standalone: true,
  imports: [CommonModule, ProfileCategoriesComponent],
  template: `
    <div class="mb-5 border-b border-slate-800/50 pb-2">
      <h2 class="text-xl font-bold text-white">Servicios y Categorías</h2>
      <p class="text-xs text-slate-400">Gestiona las categorías en las que ofreces tus servicios.</p>
    </div>

    <div *ngIf="loading" class="flex justify-center py-10">
      <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <app-profile-categories
      *ngIf="!loading && data"
      [data]="data"
      (categoryClicked)="goToCategoryDetail($event)">
    </app-profile-categories>
  `
})
export class ProfileCategoriesPage implements OnInit {
  data: ProfessionalCompleteData | null = null;
  loading = true;

  constructor(
    private professionalService: ProfessionalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        if (response.success) {
          this.data = response.data;
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  goToCategoryDetail(categoryId: number) {
    this.router.navigate(['/category-detail', categoryId]);
  }
}
