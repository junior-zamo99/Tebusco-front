import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalCompleteData } from '../../models/professional-complete.model';

@Component({
  selector: 'app-profile-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-subscription-component.html',
  styleUrls: ['./profile-subscription-component.css']
})
export class ProfileSubscriptionComponent {
  @Input() data!: ProfessionalCompleteData;

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Calcula el porcentaje para las barras de progreso
  getUsagePercent(type: 'categories' | 'offers'): number {
     const usage = this.data.usage[type];
     if (!usage || !usage.limit || typeof usage.limit !== 'number') return 0;
     return Math.min(100, (usage.used / usage.limit) * 100);
  }

  getDaysRemaining(): number {
    if (!this.data?.subscription?.endDate) return 0;
    const end = new Date(this.data.subscription.endDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  }
}
