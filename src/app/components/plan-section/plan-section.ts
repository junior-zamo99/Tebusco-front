import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// Asegúrate de importar tu servicio e interfaces desde la ruta correcta
import { PlansService, Plan, PlanInterval } from '../../services/plans.service';

@Component({
  selector: 'app-plans-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './plan-section.html',
  styleUrls: ['./plan-section.css']
})
export class PlansSectionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  plans: Plan[] = [];
  availableIntervals: Array<'daily' | 'weekly' | 'monthly' | 'yearly'> = [];
  selectedInterval: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly';
  isLoading = false;
  errorMessage = '';

  intervalLabels: { [key: string]: string } = {
    'daily': 'Diario',
    'weekly': 'Semanal',
    'monthly': 'Mensual',
    'yearly': 'Anual'
  };

  constructor(
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
    this.plansService.getAllPlans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.plans = response.data || [];
          this.detectAvailableIntervals();
          this.selectDefaultInterval();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading plans', error);
          this.errorMessage = 'No se pudieron cargar los precios en este momento.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private detectAvailableIntervals() {
    const intervalsSet = new Set<'daily' | 'weekly' | 'monthly' | 'yearly'>();
    this.plans.forEach(plan => {
      plan.intervals.forEach(interval => intervalsSet.add(interval.interval));
    });
    const order: Array<'daily' | 'weekly' | 'monthly' | 'yearly'> = ['daily', 'weekly', 'monthly', 'yearly'];
    this.availableIntervals = order.filter(i => intervalsSet.has(i));
  }

  private selectDefaultInterval() {
    if (this.availableIntervals.includes('monthly')) this.selectedInterval = 'monthly';
    else if (this.availableIntervals.includes('yearly')) this.selectedInterval = 'yearly';
    else if (this.availableIntervals.length > 0) this.selectedInterval = this.availableIntervals[0];
  }

  selectInterval(interval: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    this.selectedInterval = interval;
  }

  getIntervalForPlan(plan: Plan): PlanInterval | undefined {
    return plan.intervals.find(i => i.interval === this.selectedInterval);
  }

  isRecommended(plan: Plan): boolean {
    return plan.code === 'PREMIUM';
  }


  calculateSavings(plan: Plan, currentInterval: PlanInterval): { percentage: number } | null {
    if (currentInterval.interval === 'daily') return null;
    const dailyInterval = plan.intervals.find(i => i.interval === 'daily');

    // Si no hay tarifa diaria para comparar, intentamos comparar anual vs mensual
    if (!dailyInterval) {
        if(currentInterval.interval === 'yearly') {
            const monthly = plan.intervals.find(i => i.interval === 'monthly');
            if(monthly) {
                const totalYearlyByMonth = monthly.pricePerPeriod * 12;
                const savings = totalYearlyByMonth - currentInterval.pricePerPeriod;
                const percentage = (savings / totalYearlyByMonth) * 100;
                return savings > 0 ? { percentage: Math.round(percentage) } : null;
            }
        }
        return null;
    };

    const equivalentDailyCost = dailyInterval.pricePerPeriod * currentInterval.daysPerPeriod;
    const savings = equivalentDailyCost - currentInterval.pricePerPeriod;
    const percentage = (savings / equivalentDailyCost) * 100;

    return savings > 0 ? { percentage: Math.round(percentage) } : null;
  }
}
