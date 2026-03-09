import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ExtrasService,
  CityInfo,
  CountryWithCities,
  CityExtraType
} from '../../../services/extras.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-select-cities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-cities.component.html',
  styleUrls: ['./select-cities.component.css']
})
export class SelectCitiesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Parámetros de la ruta
  purchasedExtraId: number | null = null;
  maxCities: number = 1;
  extraType: CityExtraType = 'single_city';

  // Datos
  countries: CountryWithCities[] = [];
  selectedCityIds: Set<number> = new Set();
  primaryCityId: number | null = null;
  extraCityIds: number[] = [];

  // Estado UI
  isLoading = true;
  isProcessing = false;
  error = '';
  searchTerm = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private extrasService: ExtrasService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.purchasedExtraId = +params['id'];
      }
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['max']) {
        this.maxCities = +params['max'];
      }
      if (params['type']) {
        this.extraType = params['type'] as CityExtraType;
      }
    });

    this.loadAvailableCities();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAvailableCities(): void {
    this.isLoading = true;
    this.error = '';

    this.extrasService.getAvailableCities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.countries = response.data.countries;
            this.primaryCityId = response.data.currentCoverage.primaryCityId;
            this.extraCityIds = response.data.currentCoverage.extraCityIds || [];
            console.log('📍 Ciudades disponibles cargadas:', this.countries);
          } else {
            this.error = response.message;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al cargar las ciudades';
          this.isLoading = false;
          console.error('❌ Error cargando ciudades:', err);
        }
      });
  }

  // ========================================
  // 🔍 FILTRADO
  // ========================================

  get filteredCountries(): CountryWithCities[] {
    if (!this.searchTerm.trim()) {
      return this.countries;
    }

    const term = this.searchTerm.toLowerCase();
    return this.countries.map(country => ({
      ...country,
      cities: country.cities.filter(city =>
        city.name.toLowerCase().includes(term) ||
        city.code.toLowerCase().includes(term)
      )
    })).filter(country => country.cities.length > 0);
  }

  // ========================================
  // 🎯 SELECCIÓN
  // ========================================

  toggleCity(city: CityInfo): void {
    // No permitir seleccionar la ciudad principal
    if (city.id === this.primaryCityId) {
      return;
    }

    // No permitir seleccionar ciudades ya configuradas
    if (this.extraCityIds.includes(city.id)) {
      return;
    }

    if (this.selectedCityIds.has(city.id)) {
      this.selectedCityIds.delete(city.id);
    } else {
      // Verificar límite
      if (this.selectedCityIds.size >= this.maxCities) {
        this.dialogService.warning(
          'Límite alcanzado',
          `Solo puedes seleccionar hasta ${this.maxCities} ciudad(es)`
        );
        return;
      }
      this.selectedCityIds.add(city.id);
    }
  }

  isCitySelected(cityId: number): boolean {
    return this.selectedCityIds.has(cityId);
  }

  isCityDisabled(city: CityInfo): boolean {
    return city.id === this.primaryCityId || this.extraCityIds.includes(city.id);
  }

  getCityStatus(city: CityInfo): string {
    if (city.id === this.primaryCityId) {
      return 'principal';
    }
    if (this.extraCityIds.includes(city.id)) {
      return 'configurada';
    }
    if (this.selectedCityIds.has(city.id)) {
      return 'seleccionada';
    }
    return 'disponible';
  }

  get selectedCount(): number {
    return this.selectedCityIds.size;
  }

  get canConfirm(): boolean {
    return this.selectedCityIds.size > 0 && this.selectedCityIds.size <= this.maxCities;
  }

  getSelectedCitiesNames(): string[] {
    const names: string[] = [];
    this.countries.forEach(country => {
      country.cities.forEach(city => {
        if (this.selectedCityIds.has(city.id)) {
          names.push(city.name);
        }
      });
    });
    return names;
  }

  // ========================================
  // 💾 CONFIRMACIÓN
  // ========================================

  confirmSelection(): void {
    if (!this.purchasedExtraId || !this.canConfirm) return;

    this.isProcessing = true;
    this.error = '';

    const cityIds = Array.from(this.selectedCityIds);
    console.log('💾 Confirmando selección de ciudades:', cityIds);

    this.extrasService.selectCities(this.purchasedExtraId, cityIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            const cityNames = response.data.selectedCities.map(c => c.name).join(', ');
            this.dialogService.success(
              '¡Ciudades configuradas!',
              `Ahora aparecerás en: ${cityNames}`
            ).subscribe(() => {
              this.router.navigate(['/professional/dashboard']);
            });
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.isProcessing = false;
          this.error = err.error?.message || 'Error al configurar las ciudades';
          console.error('❌ Error configurando ciudades:', err);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/professional/dashboard']);
  }
}
