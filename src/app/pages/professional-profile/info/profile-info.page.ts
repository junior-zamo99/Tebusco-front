import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfessionalService } from '../../../services/professional.service';
import { ProfessionalCompleteData } from '../../../models/professional-complete.model';
import { ProfileOverviewComponent } from '../../../components/profile-overview-component/profile-overview-component';

@Component({
  selector: 'app-profile-info-page',
  standalone: true,
  imports: [CommonModule, ProfileOverviewComponent],
  template: `
    <div class="mb-5 border-b border-slate-800/50 pb-2">
      <h2 class="text-xl font-bold text-white">Información Personal</h2>
      <p class="text-xs text-slate-400">Administra tu información personal y de contacto.</p>
    </div>

    <div *ngIf="loading" class="flex justify-center py-10">
      <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <app-profile-overview
      *ngIf="!loading && data"
      [data]="data"
      (editClicked)="editProfile()">
    </app-profile-overview>
  `
})
export class ProfileInfoPage implements OnInit {
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

  editProfile() {
    this.router.navigate(['/edit-professional-profile']);
  }
}
