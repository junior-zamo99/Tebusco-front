import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlansService, Plan, PlanInterval, PlanFeature } from '../../../services/plans.service';

@Component({
  selector: 'app-professional-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professional-plans.component.html',
  styleUrl: './professional-plans.component.css'
})
export class ProfessionalPlansComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  plans: Plan[] = [];
  availableIntervals: Array<'daily' | 'weekly' | 'monthly' | 'yearly'> = [];
  selectedInterval: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
  selectedPlanIntervalId: number | null = null;
  selectedPlanInterval: PlanInterval | null = null;
  isLoading = false;
  errorMessage = '';

  // 📊 Mapeo de nombres de intervalos
  intervalLabels: { [key: string]: string } = {
    'daily': 'Diario',
    'weekly': 'Semanal',
    'monthly': 'Mensual',
    'yearly': 'Anual'
  };

  constructor(
    private router: Router,
    private plansService: PlansService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPlans();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private loadPlans() {
    this.isLoading = true;
    this.errorMessage = '';

    this.plansService.getAllPlans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.plans = response.data || [];

          console.log('📦 Planes cargados:', this.plans);

          this.detectAvailableIntervals();

          console.log('📊 Intervalos disponibles:', this.availableIntervals);

          this.selectDefaultInterval();

          console.log('✅ Intervalo seleccionado:', this.selectedInterval);

          if (this.plans.length > 0) {
            // Buscar el primer plan que tenga el intervalo seleccionado
            for (const plan of this.plans) {
              const intervalForPlan = this.getIntervalForPlan(plan);
              if (intervalForPlan) {
                console.log('🎯 Pre-seleccionando plan:', plan.name, intervalForPlan);
                this.selectPlanInterval(intervalForPlan);
                break;
              }
            }
          }

          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al cargar planes disponibles';
          console.error('❌ Error loading plans:', error);
          this.cdr.detectChanges();
        }
      });
  }


  private detectAvailableIntervals() {
    const intervalsSet = new Set<'daily' | 'weekly' | 'monthly' | 'yearly'>();

    this.plans.forEach(plan => {
      console.log(`📋 Plan: ${plan.name}, Intervalos:`, plan.intervals.map(i => i.interval));
      plan.intervals.forEach(interval => {
        intervalsSet.add(interval.interval);
      });
    });

    const order: Array<'daily' | 'weekly' | 'monthly' | 'yearly'> = ['daily', 'weekly', 'monthly', 'yearly'];
    this.availableIntervals = order.filter(i => intervalsSet.has(i));

    console.log('✅ Intervalos detectados:', this.availableIntervals);
  }


  private selectDefaultInterval() {
    if (this.availableIntervals.includes('monthly')) {
      this.selectedInterval = 'monthly';
    } else if (this.availableIntervals.includes('weekly')) {
      this.selectedInterval = 'weekly';
    } else if (this.availableIntervals.includes('daily')) {
      this.selectedInterval = 'daily';
    } else if (this.availableIntervals.includes('yearly')) {
      this.selectedInterval = 'yearly';
    }
  }


  selectInterval(interval: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    console.log('🔄 Cambiando intervalo a:', interval);
    this.selectedInterval = interval;
    if (this.selectedPlanInterval) {
      const plan = this.plans.find(p =>
        p.intervals.some(i => i.id === this.selectedPlanInterval!.id)
      );
      if (plan) {
        const newInterval = this.getIntervalForPlan(plan);
        if (newInterval) {
          this.selectPlanInterval(newInterval);
        } else {
          // Si no existe en este intervalo, resetear selección
          this.selectedPlanIntervalId = null;
          this.selectedPlanInterval = null;

          // Buscar el primer plan disponible en este intervalo
          for (const p of this.plans) {
            const intervalForPlan = this.getIntervalForPlan(p);
            if (intervalForPlan) {
              this.selectPlanInterval(intervalForPlan);
              break;
            }
          }
        }
      }
    }

    this.cdr.detectChanges();
  }


  selectPlanInterval(interval: PlanInterval) {
    console.log('✅ Seleccionando plan interval:', interval);
    this.selectedPlanIntervalId = interval.id;
    this.selectedPlanInterval = interval;

    localStorage.setItem('selectedPlanIntervalId', interval.id.toString());

    this.cdr.detectChanges();
  }

  isPlanSelected(plan: Plan): boolean {
    if (!this.selectedPlanInterval) return false;
    return plan.intervals.some(i => i.id === this.selectedPlanInterval!.id);
  }

  getIntervalForPlan(plan: Plan): PlanInterval | undefined {
    return plan.intervals.find(i => i.interval === this.selectedInterval);
  }


  isRecommended(plan: Plan): boolean {
    return plan.code === 'PREMIUM';
  }


  calculateSavings(plan: Plan, currentInterval: PlanInterval): { amount: number; percentage: number } | null {
    // Solo calcular para intervalos mayores a diario
    if (currentInterval.interval === 'daily') return null;

    const dailyInterval = plan.intervals.find(i => i.interval === 'daily');
    if (!dailyInterval) return null;

    // Calcular costo equivalente del intervalo diario
    const equivalentDailyCost = dailyInterval.pricePerPeriod * currentInterval.daysPerPeriod;
    const savings = equivalentDailyCost - currentInterval.pricePerPeriod;
    const percentage = (savings / equivalentDailyCost) * 100;

    return savings > 0 ? { amount: Math.round(savings), percentage: Math.round(percentage) } : null;
  }


  getPlansWithInterval(interval: 'daily' | 'weekly' | 'monthly' | 'yearly'): Plan[] {
    return this.plans.filter(plan =>
      plan.intervals.some(i => i.interval === interval)
    );
  }


  getFeatureIcon(featureKey: string): string {
    const icons: { [key: string]: string } = {
      'offers': '📊',
      'categories': '🏷️',
      'priority_support': '🎯',
      'analytics': '📈',
      'custom_profile': '✨'
    };
    return icons[featureKey] || '✓';
  }


  getPlanColor(code: string): string {
    const colors: { [key: string]: string } = {
      'BASIC': 'text-blue-500',
      'PREMIUM': 'text-primary',
      'PRO': 'text-purple-500',
      'ENTERPRISE': 'text-amber-500'
    };
    return colors[code] || 'text-primary';
  }


  hasFeatures(plan: Plan): boolean {
    const interval = this.getIntervalForPlan(plan);
    return !!(interval && interval.features.length > 0);
  }

  onContinue() {
    if (!this.selectedPlanIntervalId) {
      alert('Por favor selecciona un plan');
      return;
    }
    console.log('➡️ Navegando a pago con planIntervalId:', this.selectedPlanIntervalId);

    this.router.navigate(['/professional/payment'], {
      queryParams: {
        planIntervalId: this.selectedPlanIntervalId
      }
    });
  }

  onBack() {
    this.router.navigate(['/professional/documents']);
  }
}
