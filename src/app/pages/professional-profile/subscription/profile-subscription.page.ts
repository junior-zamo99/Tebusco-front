import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalService } from '../../../services/professional.service';
import { ProfessionalCompleteData } from '../../../models/professional-complete.model';
import { ProfileSubscriptionComponent } from '../../../components/profile-subscription-component/profile-subscription-component';

@Component({
  selector: 'app-profile-subscription-page',
  standalone: true,
  imports: [CommonModule, ProfileSubscriptionComponent],
  template: `
    <div class="mb-5 border-b border-slate-800/50 pb-2">
      <h2 class="text-xl font-bold text-white">Plan y Facturación</h2>
      <p class="text-xs text-slate-400">Gestiona tu suscripción y métodos de pago.</p>
    </div>

    <div *ngIf="loading" class="flex justify-center py-10">
      <div class="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <app-profile-subscription
      *ngIf="!loading && data"
      [data]="data">
    </app-profile-subscription>
  `
})
export class ProfileSubscriptionPage implements OnInit {
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
