import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CreditService } from '../../services/credit.service';
import { UserCredit } from '../../models/credit.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-my-credits',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-credits.component.html',
  styleUrls: ['./my-credits.component.css']
})
export class MyCreditsComponent implements OnInit, OnDestroy {
  userCredit: UserCredit | null = null;
  isLoading = true;
  hasError = false;
  errorMessage = '';
  daysUntilExpiration: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private creditService: CreditService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCreditData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos completos de créditos del usuario
   */
  loadCreditData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.creditService.getMyCredit()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (credit) => {
          this.userCredit = credit;
          this.calculateDaysUntilExpiration();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cargando créditos:', error);
          this.hasError = true;
          this.errorMessage = error.message || 'No pudimos cargar tu información de créditos';
          this.isLoading = false;
        }
      });
  }

  /**
   * Calcula los días hasta la próxima expiración
   */
  private calculateDaysUntilExpiration(): void {
    if (!this.userCredit?.nextExpirationDate) {
      this.daysUntilExpiration = null;
      return;
    }

    const now = new Date();
    const expirationDate = new Date(this.userCredit.nextExpirationDate);
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    this.daysUntilExpiration = diffDays > 0 ? diffDays : 0;
  }

  /**
   * Verifica si debe mostrar la alerta de expiración
   */
  shouldShowExpirationAlert(): boolean {
    return !!(
      this.userCredit &&
      this.userCredit.expiringCredits > 0 &&
      this.daysUntilExpiration !== null &&
      this.daysUntilExpiration <= 30
    );
  }

  /**
   * Obtiene el nivel de severidad de la alerta
   */
  getAlertSeverity(): 'info' | 'warning' | 'danger' {
    if (!this.daysUntilExpiration) return 'info';
    if (this.daysUntilExpiration === 0) return 'danger';
    if (this.daysUntilExpiration <= 7) return 'warning';
    return 'info';
  }

  /**
   * Obtiene el mensaje de la alerta según los días
   */
  getAlertMessage(): string {
    if (!this.daysUntilExpiration) return '';
    
    const amount = this.formatCurrency(this.userCredit?.expiringCredits || 0);
    
    if (this.daysUntilExpiration === 0) {
      return `🔴 ${amount} BOB expiran HOY - ¡Úsalos ahora!`;
    } else if (this.daysUntilExpiration === 1) {
      return `⚠️ ${amount} BOB expiran mañana`;
    } else if (this.daysUntilExpiration <= 7) {
      return `⚠️ ${amount} BOB expiran en ${this.daysUntilExpiration} días`;
    } else {
      return `⏰ ${amount} BOB expirarán en ${this.daysUntilExpiration} días`;
    }
  }

  /**
   * Obtiene las clases CSS de la alerta según severidad
   */
  getAlertClasses(): string {
    const severity = this.getAlertSeverity();
    const baseClasses = 'alert-card p-4 rounded-lg border-l-4 flex items-start gap-3';
    
    switch (severity) {
      case 'danger':
        return `${baseClasses} bg-danger/10 border-danger`;
      case 'warning':
        return `${baseClasses} bg-warning/10 border-warning`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-500/10 border-blue-500`;
    }
  }

  /**
   * Formatea un monto como moneda
   */
  formatCurrency(amount: number): string {
    const numAmount = Number(amount);
    return numAmount.toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Formatea la fecha de expiración
   */
  formatExpirationDate(): string {
    if (!this.userCredit?.nextExpirationDate) return '';
    
    const date = new Date(this.userCredit.nextExpirationDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  /**
   * Verifica si el usuario no tiene créditos (empty state)
   */
  isEmpty(): boolean {
    return !!(this.userCredit && 
              this.userCredit.availableCredits === 0 && 
              this.userCredit.totalCredits === 0);
  }

  /**
   * Navega a la página de historial
   */
  navigateToHistory(): void {
    this.router.navigate(['/my-credits/history']);
  }

  /**
   * Navega a la página de estadísticas
   */
  navigateToStats(): void {
    this.router.navigate(['/my-credits/stats']);
  }

  /**
   * Vuelve al dashboard
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Refresca los datos
   */
  refresh(): void {
    this.loadCreditData();
  }

  /**
   * Obtiene el porcentaje de créditos usados
   */
  getUsagePercentage(): number {
    if (!this.userCredit || this.userCredit.totalCredits === 0) return 0;
    return Math.round((this.userCredit.usedCredits / this.userCredit.totalCredits) * 100);
  }

  /**
   * Verifica si es usuario nuevo (nunca usó créditos)
   */
  isNewUser(): boolean {
    return !!(this.userCredit && 
              this.userCredit.usedCredits === 0 && 
              this.userCredit.totalCredits > 0);
  }
}
