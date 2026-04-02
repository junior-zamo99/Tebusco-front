import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlansService, Plan, PlanInterval } from '../../../services/plans.service';
import { ProfessionalExtras } from '../professional-extras/professional-extras';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-professional-plans',
  standalone: true,
  imports: [CommonModule, ProfessionalExtras],
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

  showExtrasSection = false;
  selectedExtras: any[] = [];

  intervalLabels: { [key: string]: string } = {
    'daily': 'Diario',
    'weekly': 'Semanal',
    'monthly': 'Mensual',
    'yearly': 'Anual'
  };

  constructor(
    private router: Router,
    private plansService: PlansService,
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService
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

          this.detectAvailableIntervals();
          this.selectDefaultInterval();

          if (this.plans.length > 0) {
            for (const plan of this.plans) {
              const intervalForPlan = this.getIntervalForPlan(plan);
              if (intervalForPlan) {
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
          console.error('Error loading plans:', error);
          this.cdr.detectChanges();
        }
      });
  }

  private detectAvailableIntervals() {
    const intervalsSet = new Set<'daily' | 'weekly' | 'monthly' | 'yearly'>();

    this.plans.forEach(plan => {
      plan.intervals.forEach(interval => {
        intervalsSet.add(interval.interval);
      });
    });

    const order: Array<'daily' | 'weekly' | 'monthly' | 'yearly'> = ['daily', 'weekly', 'monthly', 'yearly'];
    this.availableIntervals = order.filter(i => intervalsSet.has(i));
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
          this.selectedPlanIntervalId = null;
          this.selectedPlanInterval = null;

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
    if (currentInterval.interval === 'daily') return null;

    const dailyInterval = plan.intervals.find(i => i.interval === 'daily');
    if (!dailyInterval) return null;

    const equivalentDailyCost = dailyInterval.pricePerPeriod * currentInterval.daysPerPeriod;
    const savings = equivalentDailyCost - currentInterval.pricePerPeriod;
    const percentage = (savings / equivalentDailyCost) * 100;

    return savings > 0 ? { amount: Math.round(savings), percentage: Math.round(percentage) } : null;
  }

  onContinueToExtras() {
    if (!this.selectedPlanIntervalId) {
      alert('Por favor selecciona un plan');
      return;
    }

    this.showExtrasSection = true;

    setTimeout(() => {
      const element = document.getElementById('extras-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  onExtrasSelected(extras: any[]) {
    this.selectedExtras = extras;
    localStorage.setItem('selectedExtras', JSON.stringify(extras));
  }

  onBackToPlans() {
    this.showExtrasSection = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onProceedToPayment() {
    this.router.navigate(['/professional/payment'], {
      queryParams: {
        planIntervalId: this.selectedPlanIntervalId
      }
    });
  }

  onBack() {
    this.router.navigate(['/professional/categories']);
  }

  onSkip() {
    this.router.navigate(['/professional/dashboard']);
  }
}
