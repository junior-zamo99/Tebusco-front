import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PlansService } from '../../../services/plans.service';
import { Plan } from '../../../models/plan.model';

interface DurationOption {
  plan: Plan;
  label: string;
  selected: boolean;
}

interface GroupedPlan {
  type: string;
  name: string;
  description: string;
  isRecommended: boolean;
  durations: DurationOption[];
  selectedDuration: Plan;
  isSelected: boolean;
}

@Component({
  selector: 'app-step-3-select-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-3-select-plan.html',
  styleUrl: './step-3-select-plan.css'
})
export class Step3SelectPlan implements OnInit, OnDestroy {
  @Input() professionalData: any;
  @Output() nextStep = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  groupedPlans: GroupedPlan[] = [];
  isLoading = false;
  isLoadingPlans = true;
  selectedPlan: Plan | null = null;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private plansService: PlansService) {}

  ngOnInit() {
    this.loadPlans();
  }


  private loadPlans() {
    // this.isLoadingPlans = true;
    // this.error = null;

    // this.plansService
    //   .getActivePlans()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (plans) => {
    //       this.groupedPlans = this.groupPlansByType(plans);
    //       this.isLoadingPlans = false;

    //       const premiumPlan = this.groupedPlans.find(g => g.isRecommended);
    //       if (premiumPlan) {
    //         this.selectPlan(premiumPlan);
    //       }
    //     },
    //     error: (error) => {
    //       this.isLoadingPlans = false;
    //       this.error = 'Error al cargar planes: ' + (error.error?.message || error.message);
    //       console.error('Error loading plans:', error);
    //     }
    //   });
  }


  private groupPlansByType(plans: Plan[]): GroupedPlan[] {
    const planTypes: { [key: string]: GroupedPlan } = {};

    plans.forEach(plan => {
      const typeMatch = plan.code.match(/^([A-Z]+)/);
      if (!typeMatch) return;

      const type = typeMatch[1];

      if (!planTypes[type]) {
        planTypes[type] = {
          type,
          name: this.getTypeName(type),
          description: this.getBaseDescription(type),
          isRecommended: type === 'PREMIUM',
          durations: [],
          selectedDuration: plan,
          isSelected: false
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
      const order = { BASIC: 1, PREMIUM: 2, ENTERPRISE: 3 };
      return order[a.type as keyof typeof order] - order[b.type as keyof typeof order];
    });
  }

  private getTypeName(type: string): string {
    const names: { [key: string]: string } = {
      BASIC: 'Plan Básico',
      PREMIUM: 'Plan Premium',
      ENTERPRISE: 'Plan Enterprise'
    };
    return names[type] || type;
  }


  private getBaseDescription(type: string): string {
    const descriptions: { [key: string]: string } = {
      BASIC: 'Plan profesional con funcionalidades esenciales',
      PREMIUM: 'Plan profesional con acceso completo a funciones profesionales',
      ENTERPRISE: 'Plan profesional completo con personalización y soporte dedicado'
    };
    return descriptions[type] || 'Plan profesional';
  }


  private getDurationInfo(plan: Plan): { label: string; isDefault: boolean } {
    if (plan.days === 1) {
      return { label: 'Día', isDefault: false };
    } else if (plan.days === 7) {
      return { label: 'Semana', isDefault: false };
    } else if (plan.days === 30) {
      return { label: 'Mes', isDefault: true };
    }
    return { label: `${plan.days} días`, isDefault: false };
  }


  selectDuration(group: GroupedPlan, duration: DurationOption): void {
    group.durations.forEach(d => (d.selected = false));

    duration.selected = true;
    group.selectedDuration = duration.plan;

    if (group.isSelected) {
      this.selectedPlan = duration.plan;
    }
  }


  selectPlan(group: GroupedPlan): void {
    this.groupedPlans.forEach(g => (g.isSelected = false));

    group.isSelected = true;
    this.selectedPlan = group.selectedDuration;
  }
  get hasSelectedPlan(): boolean {
    return this.selectedPlan !== null;
  }
  get selectedPlanFeatures(): any[] {
    if (!this.selectedPlan) return [];
    return this.selectedPlan.features || [];
  }
  onNext() {
    if (!this.selectedPlan) {
      this.error = 'Por favor selecciona un plan';
      return;
    }

    this.isLoading = true;
    setTimeout(() => {
      this.nextStep.emit({ plan: this.selectedPlan });
      this.isLoading = false;
    }, 500);
  }
  onBack() {
    this.back.emit();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
