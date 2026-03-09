import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExtrasService, ExtraPackage, PurchaseResponse, CityExtraInfo } from '../../../services/extras.service';
import { SubscriptionService, PaymentMethod } from '../../../services/subscription.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-extras-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.css']
})
export class ExtrasPurchaseComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  packageId: number | null = null;
  package: ExtraPackage | null = null;

  paymentMethods: PaymentMethod[] = [];
  selectedPaymentMethodId: number | null = null;

  quantity: number = 1;

  isLoading = true;
  isProcessing = false;
  error = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private extrasService: ExtrasService,
    private subscriptionService: SubscriptionService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.packageId = +params['id'];
        this.loadData();
      } else {
        this.router.navigate(['/professional/dashboard']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;

    // Load payment methods
    this.subscriptionService.getPaymentMethods()
      . pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.paymentMethods = response.data || [];
          const firstActive = this. paymentMethods.find(m => m.isActive);
          if (firstActive) {
            this.selectedPaymentMethodId = firstActive.id;
          }
        },
        error: (err) => console.error('Error loading payment methods', err)
      });

    // Load package details
    this.extrasService.getPackages().subscribe({
      next: (response) => {
        if (response.success) {
          this.package = response.data.find(p => p.id === this.packageId) || null;
          if (!this.package) {
            this.error = 'Paquete no encontrado';
          }
        } else {
          this.error = response.message;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el paquete';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  selectPaymentMethod(id: number): void {
    this.selectedPaymentMethodId = id;
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

  confirmPurchase(): void {
    if (!this.packageId || !this.selectedPaymentMethodId) return;

    this.isProcessing = true;
    this.error = '';

    this.extrasService.purchasePackage({
      packageId: this.packageId,
      paymentMethodId: this.selectedPaymentMethodId,
      quantity: this.quantity
    }).subscribe({
      next: (response) => {
        this.isProcessing = false;
        if (response.success) {
          this.handlePurchaseSuccess(response);
        } else {
          this.error = response.message;
        }
      },
      error: (err) => {
        this.isProcessing = false;
        this.error = err.error?.message || 'Error al procesar la compra';
        console.error(err);
      }
    });
  }

  /**
   * Maneja la respuesta exitosa de compra
   * Si es un City Extra, redirige a la selección correspondiente
   */
  private handlePurchaseSuccess(response: PurchaseResponse): void {
    const { cityExtraInfo, purchasedExtra } = response.data;

    // Si NO es City Extra, mostrar éxito y volver al dashboard
    if (!cityExtraInfo) {
      this.dialogService.success(
        '¡Éxito!',
        'Compra realizada con éxito'
      ).subscribe(() => {
        this.router.navigate(['/professional/dashboard']);
      });
      return;
    }

    // Es un City Extra - necesita configuración adicional
    console.log('🏙️ City Extra comprado, requiere configuración:', cityExtraInfo);
    const purchasedExtraId = purchasedExtra.id;

    if (cityExtraInfo.nextStep === 'select_cities') {
      // Redirigir a selección de ciudades
      this.dialogService.info(
        '¡Compra exitosa!',
        `Ahora selecciona hasta ${cityExtraInfo.maxCities} ciudad(es) donde quieres aparecer`
      ).subscribe(() => {
        this.router.navigate(['/extras/select-cities', purchasedExtraId], {
          queryParams: {
            max: cityExtraInfo.maxCities,
            type: cityExtraInfo.extraType
          }
        });
      });
    } else if (cityExtraInfo.nextStep === 'select_country') {
      // Redirigir a selección de país (nacional)
      this.dialogService.info(
        '¡Compra exitosa!',
        'Ahora selecciona tu país para activar la cobertura nacional'
      ).subscribe(() => {
        this.router.navigate(['/extras/select-national', purchasedExtraId]);
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/professional/dashboard']);
  }
}
