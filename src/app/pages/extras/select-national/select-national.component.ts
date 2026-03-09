import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ExtrasService,
  CountryWithCities
} from '../../../services/extras.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-select-national',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-national.component.html',
  styleUrls: ['./select-national.component.css']
})
export class SelectNationalComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  purchasedExtraId: number | null = null;

  countries: CountryWithCities[] = [];
  selectedCountryId: number | null = null;

  isLoading = true;
  isProcessing = false;
  error = '';

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

    this.loadAvailableCountries();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAvailableCountries(): void {
    this.isLoading = true;
    this.error = '';

    this.extrasService.getAvailableCities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.countries = response.data.countries;
            console.log(' Países disponibles cargados:', this.countries);
          } else {
            this.error = response.message;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al cargar los países';
          this.isLoading = false;
          console.error('❌ Error cargando países:', err);
        }
      });
  }


  selectCountry(countryId: number): void {
    this.selectedCountryId = countryId;
  }

  isCountrySelected(countryId: number): boolean {
    return this.selectedCountryId === countryId;
  }

  getSelectedCountry(): CountryWithCities | null {
    return this.countries.find(c => c.id === this.selectedCountryId) || null;
  }

  get canConfirm(): boolean {
    return this.selectedCountryId !== null;
  }



  confirmSelection(): void {
    if (!this.purchasedExtraId || !this.selectedCountryId) return;

    this.isProcessing = true;
    this.error = '';

    console.log('💾 Confirmando cobertura nacional:', this.selectedCountryId);

    this.extrasService.selectNational(this.purchasedExtraId, this.selectedCountryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            const country = this.getSelectedCountry();
            this.dialogService.success(
              '¡Cobertura Nacional Activada!',
              `Ahora aparecerás en todas las ciudades de ${country?.name || 'tu país'}`
            ).subscribe(() => {
              this.router.navigate(['/professional/dashboard']);
            });
          } else {
            this.error = response.message;
          }
        },
        error: (err) => {
          this.isProcessing = false;
          this.error = err.error?.message || 'Error al activar la cobertura nacional';
          console.error('❌ Error activando cobertura nacional:', err);
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/professional/dashboard']);
  }

  getCountryFlag(code: string): string {
    const flags: { [key: string]: string } = {
      'BO': '🇧🇴',
      'PE': '🇵🇪',
      'AR': '🇦🇷',
      'CL': '🇨🇱',
      'CO': '🇨🇴',
      'EC': '🇪🇨',
      'BR': '🇧🇷',
      'PY': '🇵🇾',
      'UY': '🇺🇾',
      'VE': '🇻🇪',
      'MX': '🇲🇽'
    };
    return flags[code] || '🌎';
  }
}
