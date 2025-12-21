import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfessionalService } from '../../services/professional.service';
import { ProfessionalCompleteData } from '../../models/professional-complete.model';
import { environment } from '../../../environments/environment';

// Importa tus nuevos componentes hijos aquí

import { ProfileOverviewComponent } from '../../components/profile-overview-component/profile-overview-component';
import { ProfileCategoriesComponent } from '../../components/profile-categories-component/profile-categories-component';
import { ProfileSubscriptionComponent } from '../../components/profile-subscription-component/profile-subscription-component';
import { ProfileViewComponet } from '../../components/profile-view-componet/profile-view-componet';

@Component({
  selector: 'app-profile-professional-personal',
  standalone: true,
  imports: [
    CommonModule,
    ProfileOverviewComponent,
    ProfileCategoriesComponent,
    ProfileSubscriptionComponent,
    ProfileViewComponet
  ],
  templateUrl: './profile-professional-personal.html',
  styleUrl: './profile-professional-personal.css',
})
export class ProfileProfessionalPersonal implements OnInit {
  professionalData: ProfessionalCompleteData | null = null;
  loading = true;
  activeTab: string = 'profile';

  tabs = [
    { id: 'profile', label: 'Información Personal', icon: 'fas fa-user' },
    { id: 'categories', label: 'Servicios y Categorías', icon: 'fas fa-briefcase' },
    { id: 'stats', label: 'Visualizaciones', icon: 'fas fa-chart-line' },
    { id: 'subscription', label: 'Plan y Facturación', icon: 'fas fa-credit-card' },
    { id: 'documents', label: 'Documentos', icon: 'fas fa-file-contract' }
  ];

  constructor(
    private professionalService: ProfessionalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfessionalData();
  }

  loadProfessionalData() {
    this.loading = true;
    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        if (response.success) {
          this.professionalData = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  getActiveTabLabel() {
    return this.tabs.find(t => t.id === this.activeTab)?.label || 'Perfil';
  }

  editProfile() {
    this.router.navigate(['/edit-professional-profile']);
  }

  goToCategoryDetail(categoryId: number) {
    this.router.navigate(['/category-detail', categoryId]);
  }

  getPhotoUrl(): string {
     // Lógica simple para el avatar del sidebar
    if (!this.professionalData?.user?.photoUrl) return 'assets/default-avatar.png';
    if (this.professionalData.user.photoUrl.startsWith('http')) return this.professionalData.user.photoUrl;
    return `${environment.backendUrl}${this.professionalData.user.photoUrl}`;
  }
}
