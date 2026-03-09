import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalService } from '../../../services/professional.service';
import { ProfessionalCompleteData } from '../../../models/professional-complete.model';
import { ProfileViewComponet } from '../../../components/profile-view-componet/profile-view-componet';

@Component({
  selector: 'app-profile-stats-page',
  standalone: true,
  imports: [CommonModule, ProfileViewComponet],
  template: `
    <div class="mb-5 border-b border-slate-800/50 pb-2">
      <h2 class="text-xl font-bold text-white">Visualizaciones</h2>
      <p class="text-xs text-slate-400">Estadísticas de visitas a tu perfil.</p>
    </div>

    <app-profile-view-componet></app-profile-view-componet>
  `
})
export class ProfileStatsPage implements OnInit {
  data: ProfessionalCompleteData | null = null;
  loading = true;

  constructor(private professionalService: ProfessionalService) {}

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
}
