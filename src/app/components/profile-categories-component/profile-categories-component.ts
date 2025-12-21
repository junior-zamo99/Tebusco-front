import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalCompleteData } from '../../models/professional-complete.model';

@Component({
  selector: 'app-profile-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-categories-component.html',
  styleUrls: ['./profile-categories-component.css']
})
export class ProfileCategoriesComponent {
  @Input() data!: ProfessionalCompleteData;
  @Output() categoryClicked = new EventEmitter<number>();

  getCategoryIcon(index: number): string {
    const icons = ['💻', '🗣️', '🎨', '📊', '⚡', '🔧', '📷', '🏥'];
    return icons[index % icons.length];
  }

  // Helper para colores de estado
  getStatusClasses(status: string): string {
    switch(status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-700 text-slate-300';
    }
  }

  getStatusLabel(status: string): string {
    const labels: {[key:string]: string} = {
      'approved': 'Aprobado', 'pending': 'Pendiente', 'rejected': 'Rechazado'
    };
    return labels[status] || status;
  }
}
