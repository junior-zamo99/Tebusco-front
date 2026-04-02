import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  SubscriptionService,
  PaymentMethod,
  CreateSubscriptionResponse,
  ExtraRequest,
  PurchaseOptions
} from '../../../services/subscription.service';
import {
  PlansService,
  Plan,
  PlanInterval,
  PlanFeature
} from '../../../services/plans.service';
import { SelectedExtra } from '../../../services/extras.service';
import {
  CouponService,
  CouponValidationResult,
  CouponValidationItem
} from '../../../services/coupon.service';

@Component({
  selector: 'app-professional-payment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './professional-payment.component.html',
  styleUrl: './professional-payment.component.css'
})
export class ProfessionalPaymentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  planIntervalId: number | null = null;
  planInterval: PlanInterval | null = null;
  plan: Plan | null = null;

  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethodId: number | null = null;

  selectedExtras: SelectedExtra[] = [];


  couponCode: string = '';
  appliedCoupon: CouponValidationResult | null = null;
  isCouponValidating: boolean = false;
  couponError: string = '';
  couponSuccess: string = '';

  autoRenew = true;
  agreeTerms = false;

  isLoading = false;
  isProcessing = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    private plansService: PlansService,
    private couponService: CouponService
  ) {}

  ngOnInit() {
    this.loadPlanIntervalId();
    this.loadPaymentMethods();
    this.loadPlanDetails();
    this.loadSelectedExtras();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private loadPlanIntervalId() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['planIntervalId']) {
        this.planIntervalId = parseInt(params['planIntervalId'], 10);
        localStorage.setItem('selectedPlanIntervalId', this.planIntervalId.toString());
      } else {
        const stored = localStorage.getItem('selectedPlanIntervalId');
        if (stored) {
          this.planIntervalId = parseInt(stored, 10);
        } else {
          this.router.navigate(['/professional/plans']);
        }
      }
    });
  }


  private loadPaymentMethods() {
    this.subscriptionService.getPaymentMethods()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.paymentMethods = response.data || [];

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


  private loadSelectedExtras() {
    try {
      const stored = localStorage.getItem('selectedExtras');
      if (stored) {
        this.selectedExtras = JSON.parse(stored);
        console.log('🎁 Extras cargados desde localStorage:', this.selectedExtras);
      } else {
        this.selectedExtras = [];
        console.log('ℹ️ No hay extras seleccionados');
      }
    } catch (error) {
      console.error('❌ Error al cargar extras:', error);
      this.selectedExtras = [];
    }
  }


  selectPaymentMethod(methodId: number) {
    this.selectedPaymentMethodId = methodId;
    console.log('💳 Método de pago seleccionado:', methodId);
  }

  toggleAutoRenew() {
    this.autoRenew = !this.autoRenew;
  }

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


  get planAmount(): number {
    return this.planInterval?.pricePerPeriod || 0;
  }

  get extrasAmount(): number {
    return this.selectedExtras.reduce((sum, extra) => sum + extra.totalPrice, 0);
  }

  get subtotal(): number {
    return this.planAmount + this.extrasAmount;
  }

  get discountAmount(): number {
    return this.appliedCoupon?.totalDiscountAmount || 0;
  }

  get totalPrice(): number {
    const final = this.subtotal - this.discountAmount;
    return Math.max(0, final);
  }

  get discountPercentage(): number {
    if (this.subtotal === 0 || this.discountAmount === 0) return 0;
    return Math.round((this.discountAmount / this.subtotal) * 100);
  }

  get currency(): string {
    return this.planInterval?.currency || 'BOB';
  }

  get hasExtras(): boolean {
    return this.selectedExtras.length > 0;
  }

  get hasCoupon(): boolean {
    return this.appliedCoupon !== null && this.appliedCoupon.valid;
  }


  getPaymentMethodIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'card': '💳',
      'qr': '📱',
      'mobile_payment': '📲',
      'bank_transfer': '🏦'
    };
    return icons[type] || '💵';
  }


  validateCoupon() {
    if (!this.couponCode || this.couponCode.trim() === '') {
      this.couponError = 'Por favor ingresa un código de cupón';
      return;
    }

    if (!this.planIntervalId) {
      this.couponError = 'No se ha seleccionado un plan';
      return;
    }

    this.couponError = '';
    this.couponSuccess = '';
    this.isCouponValidating = true;

    const items: CouponValidationItem[] = [];

    items.push({
      type: 'plan',
      id: this.planIntervalId,
      amount: this.planAmount,
      quantity: 1
    });

    this.selectedExtras.forEach(extra => {
      items.push({
        type: 'extra',
        id: extra.packageId,
        amount: extra.price,
        quantity: extra.quantity
      });
    });

    console.log('🎫 Validando cupón:', {
      code: this.couponCode,
      items,
      totalAmount: this.subtotal
    });

    this.couponService.validateCoupon(
      this.couponCode,
      items,
      this.subtotal
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        this.isCouponValidating = false;
        const result = response.data;

        if (result.valid) {
          this.appliedCoupon = result;
          const discountAmount = result.totalDiscountAmount || 0;
          this.couponSuccess = `Cupón aplicado! Descuento: ${this.currency} ${discountAmount.toFixed(2)}`;
          this.couponError = '';
          console.log('✅ Cupón válido:', result);
        } else {
          this.couponError = result.reason || 'Cupón inválido';
          this.appliedCoupon = null;
          console.warn('⚠️ Cupón inválido:', result);
        }
      },
      error: (error) => {
        this.isCouponValidating = false;
        this.couponError = error.error?.message || 'Error al validar cupón';
        this.appliedCoupon = null;
        console.error('❌ Error validando cupón:', error);
      }
    });
  }


  removeCoupon() {
    this.couponCode = '';
    this.appliedCoupon = null;
    this.couponError = '';
    this.couponSuccess = '';
    console.log('🗑️ Cupón removido');
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

    const extras: ExtraRequest[] = this.selectedExtras.map(extra => ({
      packageId: extra.packageId,
      quantity: extra.quantity
    }));

    let options: PurchaseOptions | undefined = undefined;

    if (this.hasCoupon) {
      options = {
        couponCode: this.couponCode
      };
    }

    console.log('🔄 Procesando pago:', {
      planIntervalId: this.planIntervalId,
      paymentMethodId: this.selectedPaymentMethodId,
      autoRenew: this.autoRenew,
      extras: extras,
      options: options
    });

    this.subscriptionService.createSubscription(
      this.planIntervalId,
      this.selectedPaymentMethodId || 0,
      this.autoRenew,
      extras.length > 0 ? extras : undefined,
      options
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(

      {
      next: (response: CreateSubscriptionResponse) => {
        this.isProcessing = false;

        console.log('✅ Suscripción creada exitosamente:', response);

        // Limpiar localStorage después de éxito
        localStorage.removeItem('selectedPlanIntervalId');
        localStorage.removeItem('selectedExtras');

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
        } else if (error.error?.error === 'INVALID_COUPON') {
          this.errorMessage = 'El cupón ingresado no es válido o ya expiró.';
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
