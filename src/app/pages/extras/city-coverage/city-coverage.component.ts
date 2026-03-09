import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ExtrasService,
  CoverageInfo,
  PurchasedExtraDetail
} from '../../../services/extras.service';

@Component({
  selector: 'app-city-coverage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './city-coverage.component.html',
  styleUrls: ['./city-coverage.component.css']
})
export class CityCoverageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Datos
  coverage: CoverageInfo | null = null;

  // Estado UI
  isLoading = true;
  error = '';

  constructor(
    private router: Router,
    private extrasService: ExtrasService
  ) {}

  ngOnInit(): void {
    this.loadCoverage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCoverage(): void {
    this.isLoading = true;
    this.error = '';

    this.extrasService.getCoverage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.coverage = response.data;
            console.log('🗺️ Cobertura cargada:', this.coverage);
          } else {
            this.error = response.message;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al cargar la cobertura';
          this.isLoading = false;
          console.error('❌ Error cargando cobertura:', err);
        }
      });
  }

  // ========================================
  // 🎨 UTILIDADES UI
  // ========================================

  get hasCoverage(): boolean {
    if (!this.coverage) return false;
    return this.coverage.primaryCity !== null ||
           this.coverage.extraCities.length > 0 ||
           this.coverage.hasNationalCoverage;
  }

  get pendingExtras(): PurchasedExtraDetail[] {
    if (!this.coverage) return [];
    return this.coverage.purchasedExtras.filter(e => !e.isConfigured);
  }

  get configuredExtras(): PurchasedExtraDetail[] {
    if (!this.coverage) return [];
    return this.coverage.purchasedExtras.filter(e => e.isConfigured);
  }

  getExtraTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'single_city': '1 Ciudad',
      'multi_city': 'Multi-ciudad',
      'national': 'Nacional'
    };
    return labels[type] || type;
  }

  getExtraTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'single_city': '📍',
      'multi_city': '🗺️',
      'national': '🌎'
    };
    return icons[type] || '✨';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  configurePendingExtra(extra: PurchasedExtraDetail): void {
    if (extra.extraType === 'national') {
      this.router.navigate(['/extras/select-national', extra.id]);
    } else {
      this.router.navigate(['/extras/select-cities', extra.id], {
        queryParams: {
          max: extra.maxCities,
          type: extra.extraType
        }
      });
    }
  }

  buyMoreExtras(): void {
    this.router.navigate(['/extras']);
  }

  goBack(): void {
    this.router.navigate(['/professional/dashboard']);
  }
}
