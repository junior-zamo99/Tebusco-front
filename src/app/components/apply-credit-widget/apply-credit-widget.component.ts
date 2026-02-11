import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreditService } from '../../services/credit.service';
import { CreditBalance } from '../../models/credit.model';

@Component({
  selector: 'app-apply-credit-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './apply-credit-widget.component.html',
  styleUrls: ['./apply-credit-widget.component.css']
})
export class ApplyCreditWidgetComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Exponer Math para uso en template
  Math = Math;

  // Inputs
  @Input() totalAmount: number = 0;          // Monto total a pagar
  @Input() disabled: boolean = false;        // Deshabilitar widget

  // Outputs
  @Output() creditApplied = new EventEmitter<number>();   // Emitir monto aplicado
  @Output() creditRemoved = new EventEmitter<void>();     // Emitir cuando se limpie

  // Estado del widget
  useCredits = false;                        // Checkbox activo
  creditAmount: number = 0;                  // Monto ingresado por usuario
  creditAmountInput: string = '';            // Input string para binding

  // Datos de créditos
  creditBalance: CreditBalance | null = null;
  availableCredits = 0;
  isLoadingBalance = false;
  balanceError = '';

  // Validación
  validationError = '';
  isValidating = false;

  constructor(private creditService: CreditService) {}

  ngOnInit(): void {
    this.loadCreditBalance();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 💰 Cargar balance de créditos disponibles
   */
  loadCreditBalance(): void {
    this.isLoadingBalance = true;
    this.balanceError = '';

    this.creditService.getMyBalance()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balance) => {
          this.creditBalance = balance;
          this.availableCredits = balance.availableCredits;
          this.isLoadingBalance = false;
          console.log('💰 Balance de créditos cargado:', this.availableCredits);
        },
        error: (error) => {
          this.balanceError = 'Error al cargar créditos';
          this.isLoadingBalance = false;
          console.error('Error loading credit balance:', error);
        }
      });
  }

  /**
   * 🔄 Toggle checkbox "Usar créditos"
   */
  toggleUseCredits(): void {
    this.useCredits = !this.useCredits;

    if (!this.useCredits) {
      // Si se desactiva, limpiar todo
      this.clearCredits();
    } else {
      // Si se activa y no hay balance cargado, intentar cargar
      if (this.availableCredits === 0 && !this.isLoadingBalance) {
        this.loadCreditBalance();
      }
    }
  }

  /**
   * 💵 Aplicar monto de créditos ingresado
   */
  applyCreditAmount(): void {
    // Parsear el input
    const amount = parseFloat(this.creditAmountInput);

    if (isNaN(amount) || amount <= 0) {
      this.validationError = 'Ingresa un monto válido mayor a 0';
      return;
    }

    // Validar límites localmente primero
    const validationResult = this.validateAmountLocally(amount);
    if (!validationResult.valid) {
      this.validationError = validationResult.error;
      return;
    }

    // Validar con el servidor
    this.validationError = '';
    this.isValidating = true;

    this.creditService.validateCredit(amount)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (validation) => {
          this.isValidating = false;

          if (validation.valid && validation.canUse) {
            // Aplicar créditos
            this.creditAmount = amount;
            this.validationError = '';
            this.creditApplied.emit(amount);
            console.log('✅ Créditos aplicados:', amount);
          } else {
            // No se pueden usar
            this.validationError = validation.reason || 'No puedes usar esa cantidad de créditos';
            this.creditAmount = 0;
          }
        },
        error: (error) => {
          this.isValidating = false;
          this.validationError = error.error?.message || 'Error al validar créditos';
          this.creditAmount = 0;
          console.error('Error validating credits:', error);
        }
      });
  }

  /**
   * ✅ Validar monto localmente (antes de llamar al servidor)
   */
  private validateAmountLocally(amount: number): { valid: boolean; error: string } {
    if (amount > this.availableCredits) {
      return {
        valid: false,
        error: `No tienes suficientes créditos. Disponible: ${this.formatCurrency(this.availableCredits)} BOB`
      };
    }

    if (amount > this.totalAmount) {
      return {
        valid: false,
        error: `El monto no puede ser mayor al total a pagar (${this.formatCurrency(this.totalAmount)} BOB)`
      };
    }

    return { valid: true, error: '' };
  }

  /**
   * 🎯 Usar todo el crédito disponible (o el total si es menor)
   */
  useAllCredits(): void {
    const maxAmount = Math.min(this.availableCredits, this.totalAmount);
    this.creditAmountInput = maxAmount.toFixed(2);
    this.applyCreditAmount();
  }

  /**
   * 📊 Usar porcentaje del total
   */
  usePercentage(percentage: number): void {
    const calculatedAmount = (this.totalAmount * percentage) / 100;
    const maxAmount = Math.min(calculatedAmount, this.availableCredits);
    this.creditAmountInput = maxAmount.toFixed(2);
    this.applyCreditAmount();
  }

  /**
   * 🗑️ Limpiar créditos aplicados
   */
  clearCredits(): void {
    this.creditAmount = 0;
    this.creditAmountInput = '';
    this.validationError = '';
    this.creditRemoved.emit();
    console.log('🗑️ Créditos removidos');
  }

  /**
   * 🔄 Refrescar balance de créditos
   */
  refreshBalance(): void {
    this.loadCreditBalance();
  }

  /**
   * 💵 Calcular nuevo total después de aplicar créditos
   */
  get newTotal(): number {
    return Math.max(0, this.totalAmount - this.creditAmount);
  }

  /**
   * ✅ Verificar si se están usando créditos actualmente
   */
  get isUsingCredits(): boolean {
    return this.useCredits && this.creditAmount > 0;
  }

  /**
   * ✅ Verificar si el usuario tiene créditos disponibles
   */
  get hasCredits(): boolean {
    return this.availableCredits > 0;
  }

  /**
   * ✅ Verificar si puede usar créditos (tiene balance y hay monto a pagar)
   */
  get canUseCredits(): boolean {
    return this.hasCredits && this.totalAmount > 0 && !this.disabled;
  }

  /**
   * 📅 Obtener días hasta expiración
   */
  get daysUntilExpiration(): number | null {
    if (!this.creditBalance?.nextExpirationDate) return null;

    const now = new Date();
    const expirationDate = new Date(this.creditBalance.nextExpirationDate);
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * ⚠️ Verificar si debe mostrar alerta de expiración
   */
  get shouldShowExpirationWarning(): boolean {
    const days = this.daysUntilExpiration;
    return days !== null && days <= 7;
  }

  /**
   * 💰 Formatear monto como moneda
   */
  formatCurrency(amount: number): string {
    return amount.toFixed(2);
  }

  /**
   * 📝 Manejar cambio en el input de monto
   */
  onAmountInputChange(): void {
    // Limpiar error de validación mientras escribe
    if (this.validationError) {
      this.validationError = '';
    }
  }

  /**
   * ⌨️ Manejar Enter en el input
   */
  onAmountInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.applyCreditAmount();
    }
  }

  /**
   * 🎨 Obtener clase CSS según severidad de expiración
   */
  get expirationSeverityClass(): string {
    const days = this.daysUntilExpiration;
    if (days === null) return '';
    if (days === 0) return 'text-danger';
    if (days <= 3) return 'text-warning';
    return 'text-info';
  }

  /**
   * 📊 Calcular ahorro (créditos aplicados)
   */
  get savingsAmount(): number {
    return this.creditAmount;
  }

  /**
   * 📊 Calcular porcentaje de ahorro
   */
  get savingsPercentage(): number {
    if (this.totalAmount === 0) return 0;
    return Math.round((this.creditAmount / this.totalAmount) * 100);
  }
}
