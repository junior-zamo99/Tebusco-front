import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  SubscriptionService,
  PaymentMethod,
  CreateSubscriptionResponse
} from '../../../services/subscription.service';
import {
  PlansService,
  Plan,
  PlanInterval,
  PlanFeature
} from '../../../services/plans.service';

@Component({
  selector: 'app-professional-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './professional-payment.component.html',
  styleUrl: './professional-payment.component.css'
})
export class ProfessionalPaymentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos del plan
  planIntervalId: number | null = null;
  planInterval: PlanInterval | null = null;
  plan: Plan | null = null;


  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethodId: number | null = null;

  // Opciones
  autoRenew = true;
  agreeTerms = false;

  // Estados
  isLoading = false;
  isProcessing = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    private plansService: PlansService
  ) {}

  ngOnInit() {
    this.loadPlanIntervalId();
    this.loadPaymentMethods();
    this.loadPlanDetails();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 📥 Cargar planIntervalId desde query params o localStorage
   */
  private loadPlanIntervalId() {
    // Intentar desde query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['planIntervalId']) {
        this.planIntervalId = parseInt(params['planIntervalId'], 10);
        localStorage.setItem('selectedPlanIntervalId', this.planIntervalId.toString());
      } else {
        // Intentar desde localStorage
        const stored = localStorage.getItem('selectedPlanIntervalId');
        if (stored) {
          this.planIntervalId = parseInt(stored, 10);
        } else {
          // No hay plan seleccionado, redirigir
          this.router.navigate(['/professional/plans']);
        }
      }
    });
  }

  /**
   * 📋 PASO 10: Listar Métodos de Pago
   * GET /subscriptions/payment-methods
   */
  private loadPaymentMethods() {
    this.subscriptionService.getPaymentMethods()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.paymentMethods = response.data || [];

          // Pre-seleccionar el primer método activo
          const firstActiveMethod = this.paymentMethods.find(m => m.isActive);
          if (firstActiveMethod) {
            this.selectedPaymentMethodId = firstActiveMethod.id;
          }

          console.log('💳 Métodos de pago cargados:', this.paymentMethods);
        },
        error: (error) => {
          this.errorMessage = 'Error al cargar métodos de pago';
          console.error('Error:', error);
        }
      });
  }

  /**
   * 📊 Cargar detalles del plan seleccionado
   */
  private loadPlanDetails() {
    if (!this.planIntervalId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.plansService.getAllPlans()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          const plans = response.data || [];

          // Buscar el plan que contiene el interval seleccionado
          for (const p of plans) {
            const interval = p.intervals.find(i => i.id === this.planIntervalId);
            if (interval) {
              this.plan = p;
              this.planInterval = interval;
              console.log('✅ Plan encontrado:', this.plan);
              console.log('✅ Interval encontrado:', this.planInterval);
              break;
            }
          }

          if (!this.planInterval) {
            this.errorMessage = 'Plan no encontrado';
            console.error('❌ Plan interval ID no encontrado:', this.planIntervalId);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al cargar detalles del plan';
          console.error('Error:', error);
        }
      });
  }

  /**
   * 💳 Seleccionar método de pago
   */
  selectPaymentMethod(methodId: number) {
    this.selectedPaymentMethodId = methodId;
    console.log('💳 Método de pago seleccionado:', methodId);
  }

  /**
   * 🔄 Toggle auto-renovación
   */
  toggleAutoRenew() {
    this.autoRenew = !this.autoRenew;
  }

  /**
   * 📊 Calcular fechas de suscripción
   */
  get subscriptionStartDate(): string {
    const today = new Date();
    return today.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get subscriptionEndDate(): string {
    if (!this.planInterval) return '';

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + this.planInterval.daysPerPeriod);

    return endDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * 💰 Precio total
   */
  get totalPrice(): number {
    return this.planInterval?.pricePerPeriod || 0;
  }

  /**
   * 🎨 Obtener icono del método de pago
   */
  getPaymentMethodIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'card': '💳',
      'qr': '📱',
      'mobile_payment': '📲',
      'bank_transfer': '🏦'
    };
    return icons[type] || '💵';
  }


  onConfirmPayment() {

    if (!this.agreeTerms) {
      return;
    }

    if (!this.planIntervalId) {
      this.errorMessage = 'No se ha seleccionado un plan';
      return;
    }



    this.isProcessing = true;
    this.errorMessage = '';

    console.log('🔄 Procesando pago:', {
      planIntervalId: this.planIntervalId,
      paymentMethodId: this.selectedPaymentMethodId,
      autoRenew: this.autoRenew
    });

    this.subscriptionService.createSubscription(
      this.planIntervalId,
      this.selectedPaymentMethodId || 0,
      this.autoRenew
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(

      {
      next: (response: CreateSubscriptionResponse) => {
        this.isProcessing = false;

        console.log('✅ Suscripción creada exitosamente:', response);

        this.router.navigate(['/professional/payment-success']);
      },
      error: (error) => {
        this.isProcessing = false;

        console.error('❌ Error al procesar pago:', error);

        if (error.error?.error === 'SUBSCRIPTION_ALREADY_EXISTS') {
          this.errorMessage = 'Ya tienes una suscripción activa';
          setTimeout(() => {
            this.router.navigate(['/professional/profile']);
          }, 2000);
        } else if (error.error?.error === 'INVALID_PLAN_INTERVAL') {
          this.errorMessage = 'Plan inválido. Por favor selecciona otro plan.';
        } else if (error.error?.error === 'PAYMENT_FAILED') {
          this.errorMessage = 'Error en el pago. Por favor intenta con otro método.';
        } else {
          this.errorMessage = error.error?.message || 'Error al procesar el pago. Intenta nuevamente.';
        }
      }
    });
  }


  onBack() {
    this.router.navigate(['/professional/plans']);
  }

  isPaymentMethodSelected(methodId: number): boolean {
    return this.selectedPaymentMethodId === methodId;
  }
}
