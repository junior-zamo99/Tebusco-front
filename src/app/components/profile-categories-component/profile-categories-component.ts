import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProfessionalCompleteData } from '../../models/professional-complete.model';

@Component({
  selector: 'app-profile-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-categories-component.html',
  styleUrls: ['./profile-categories-component.css']
})
export class ProfileCategoriesComponent {
  @Input() data!: ProfessionalCompleteData;
  @Output() categoryClicked = new EventEmitter<number>();

  getActiveCount(): number {
    return this.data.profileCategories.filter(cat => cat.isActive).length;
  }

  getUsagePercentage(): number {
    if (!this.data.usage?.categories?.limit) return 0;
    const limit = Number(this.data.usage.categories.limit);
    if (limit === 0) return 0;
    return (this.data.usage.categories.used / limit) * 100;
  }

  getAvailableCategories(): number {
    if (!this.data.usage?.categories?.available) return 0;
    return Number(this.data.usage.categories.available);
  }
}
