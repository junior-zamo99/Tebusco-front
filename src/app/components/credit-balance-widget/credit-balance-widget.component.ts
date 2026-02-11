import { Component, OnInit, Input, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreditService } from '../../services/credit.service';
import { CreditBalance } from '../../models/credit.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-credit-balance-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credit-balance-widget.component.html',
  styleUrls: ['./credit-balance-widget.component.css']
})
export class CreditBalanceWidgetComponent implements OnInit, OnDestroy {
  @Input() isMobile = false;

  balance: CreditBalance | null = null;
  isLoading = true;
  hasError = false;
  showTooltip = false;
  daysUntilExpiration: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private creditService: CreditService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBalance();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga el balance de créditos del usuario
   */
  loadBalance(): void {
    this.isLoading = true;
    this.hasError = false;

    this.creditService.getMyBalance()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balance) => {
          this.balance = balance;
          this.calculateDaysUntilExpiration();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando balance de créditos:', error);
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  /**
   * Método público para refrescar el balance (llamado desde navbar)
   */
  refreshBalance(): void {
    this.loadBalance();
  }

  /**
   * Calcula los días hasta la próxima expiración
   */
  private calculateDaysUntilExpiration(): void {
    if (!this.balance?.nextExpirationDate) {
      this.daysUntilExpiration = null;
      return;
    }

    const now = new Date();
    const expirationDate = new Date(this.balance.nextExpirationDate);
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    this.daysUntilExpiration = diffDays > 0 ? diffDays : 0;
  }

  /**
   * Formatea el balance con 2 decimales
   */
  formatBalance(): string {
    if (!this.balance) return '0.00';
    const credits = Number(this.balance.availableCredits);
    return credits.toFixed(2);
  }

  /**
   * Formatea créditos por expirar
   */
  formatExpiringCredits(): string {
    if (!this.balance) return '0.00';
    const credits = Number(this.balance.expiringCredits);
    return credits.toFixed(2);
  }

  /**
   * Retorna el color del badge según los días restantes
   */
  getWarningBadgeClass(): string {
    if (!this.daysUntilExpiration) return '';
    
    if (this.daysUntilExpiration === 0) {
      return 'bg-danger'; // Rojo - expiran hoy
    } else if (this.daysUntilExpiration <= 7) {
      return 'bg-warning'; // Naranja - expiran en 7 días
    } else if (this.daysUntilExpiration <= 30) {
      return 'bg-yellow-500'; // Amarillo - expiran en 30 días
    }
    return '';
  }

  /**
   * Retorna el mensaje de advertencia según los días restantes
   */
  getWarningMessage(): string {
    if (!this.daysUntilExpiration) return '';
    
    if (this.daysUntilExpiration === 0) {
      return 'Expiran hoy';
    } else if (this.daysUntilExpiration === 1) {
      return 'Expiran mañana';
    } else if (this.daysUntilExpiration <= 7) {
      return `Expiran en ${this.daysUntilExpiration} días`;
    } else if (this.daysUntilExpiration <= 30) {
      return `Expiran en ${this.daysUntilExpiration} días`;
    }
    return '';
  }

  /**
   * Retorna el ícono de advertencia según los días restantes
   */
  getWarningIcon(): string {
    if (!this.daysUntilExpiration) return '';
    
    if (this.daysUntilExpiration === 0) {
      return '🔴'; // Expiran hoy
    } else if (this.daysUntilExpiration <= 7) {
      return '⚠️'; // Expiran pronto
    } else if (this.daysUntilExpiration <= 30) {
      return '⏰'; // Expiran en el mes
    }
    return '';
  }

  /**
   * Verifica si debe mostrar advertencia de expiración
   */
  shouldShowWarning(): boolean {
    return !!(
      this.balance &&
      this.balance.expiringCredits > 0 &&
      this.daysUntilExpiration !== null &&
      this.daysUntilExpiration <= 30
    );
  }

  /**
   * Toggle del tooltip (click)
   */
  toggleTooltip(): void {
    if (!this.isMobile) {
      this.showTooltip = !this.showTooltip;
    }
  }

  /**
   * Cierra el tooltip al hacer click fuera
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const widgetElement = document.querySelector('.credit-balance-widget');
    
    if (widgetElement && !widgetElement.contains(target)) {
      this.showTooltip = false;
    }
  }

  /**
   * Navega a la página de créditos
   */
  navigateToCredits(): void {
    this.showTooltip = false;
    this.router.navigate(['/my-credits']);
  }

  /**
   * Formatea la fecha de expiración
   */
  formatExpirationDate(): string {
    if (!this.balance?.nextExpirationDate) return '';
    
    const date = new Date(this.balance.nextExpirationDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  /**
   * Verifica si tiene créditos disponibles
   */
  hasCredits(): boolean {
    return !!(this.balance && this.balance.availableCredits > 0);
  }

  /**
   * Retry al hacer click en estado de error
   */
  onRetry(): void {
    this.loadBalance();
  }
}
