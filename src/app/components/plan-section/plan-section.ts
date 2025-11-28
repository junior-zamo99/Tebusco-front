import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlansService } from '../../services/plans.service';
import { Plan } from '../../models/plan.model';

interface GroupedPlan {
  type: string;
  name: string;
  description: string;
  isRecommended: boolean;
  durations: {
    plan: Plan;
    label: string;
    selected: boolean;
  }[];
  selectedDuration: Plan;
}

@Component({
  selector: 'app-plans-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './plan-section.html',
  styleUrls: ['./plan-section.css']
})
export class PlansSectionComponent implements OnInit {
  groupedPlans: GroupedPlan[] = [];
  isLoadingPlans = true;

  constructor(private plansService: PlansService) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {

  }

  private groupPlansByType(plans: Plan[]): GroupedPlan[] {
    const planTypes: { [key: string]: GroupedPlan } = {};

    plans.forEach(plan => {
      const typeMatch = plan.code.match(/^([A-Z]+)-/);
      if (!typeMatch) return;

      const type = typeMatch[1];

      if (!planTypes[type]) {
        planTypes[type] = {
          type,
          name: this.getTypeName(type),
          description: this.getBaseDescription(plan.description),
          isRecommended: type === 'ENTERPRISE',
          durations: [],
          selectedDuration: plan
        };
      }

      const duration = this.getDurationInfo(plan);
      planTypes[type].durations.push({
        plan,
        label: duration.label,
        selected: duration.isDefault
      });

      if (duration.isDefault) {
        planTypes[type].selectedDuration = plan;
      }
    });

    Object.values(planTypes).forEach(group => {
      group.durations.sort((a, b) => a.plan.days - b.plan.days);
    });

    return Object.values(planTypes).sort((a, b) => {
      const order = { 'BASIC': 1, 'PREMIUM': 2, 'ENTERPRISE': 3 };
      return order[a.type as keyof typeof order] - order[b.type as keyof typeof order];
    });
  }

  private getTypeName(type: string): string {
    const names: { [key: string]: string } = {
      'BASIC': 'Plan Básico',
      'PREMIUM': 'Plan Premium',
      'ENTERPRISE': 'Plan Enterprise'
    };
    return names[type] || type;
  }

  private getBaseDescription(description: string): string {
    return description.replace(/Plan (básico|premium|empresarial) (semanal|mensual|de prueba por 1 día)/i, 'Plan profesional');
  }

  private getDurationInfo(plan: Plan): { label: string; isDefault: boolean } {
    if (plan.days === 1) {
      return { label: '1 Día', isDefault: false };
    } else if (plan.days === 7) {
      return { label: '1 Semana', isDefault: false };
    } else if (plan.days === 30) {
      return { label: '1 Mes', isDefault: true };
    }
    return { label: `${plan.days} días`, isDefault: false };
  }

  selectDuration(group: GroupedPlan, duration: { plan: Plan; label: string; selected: boolean }): void {
    group.durations.forEach(d => d.selected = false);
    duration.selected = true;
    group.selectedDuration = duration.plan;
  }

  getFeaturesList(plan: Plan): string[] {
    return plan.features.slice(0, 5).map(f => {
      if (f.limit) {
        return `${f.featureName}: ${f.limit}`;
      }
      return f.featureName;
    });
  }
}
