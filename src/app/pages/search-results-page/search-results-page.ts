import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';

import { SearchService } from '../../services/search.service';
import { LocationService } from '../../services/location.service';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { NavigationHistoryService } from '../../services/navigation-history.service';

import {
  SearchGeneralData,
  CategorySearchResult,
  ProviderSearchResult,
  SearchQuery
} from '../../interface/search.interface';
import { City } from '../../models/location.model';

type SexFilter = '' | 'M' | 'F';

@Component({
  selector: 'app-search-results-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-results-page.html',
  styleUrl: './search-results-page.css'
})
export class SearchResultsPage implements OnInit, OnDestroy {

  // ─── Query params / state ───────────────────────────────────────────────────
  searchTerm: string = '';
  selectedCityIds: number[] = [];
  selectedSex: SexFilter = '';

  // ─── Data ───────────────────────────────────────────────────────────────────
  searchResults: SearchGeneralData | null = null;
  cities: City[] = [];

  // ─── UI ─────────────────────────────────────────────────────────────────────
  isLoading: boolean = false;
  isLoadingCities: boolean = false;
  error: string | null = null;
  isMobileFilterOpen: boolean = false;

  private searchSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private searchService: SearchService,
    private locationService: LocationService,
    private authService: AuthService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
    private navHistory: NavigationHistoryService
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.setupSearchPipeline();

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchTerm = params['term'] || '';
        const citiesParam = params['cities'];
        this.selectedCityIds = citiesParam
          ? citiesParam.split(',').map(Number).filter(Boolean)
          : [];
        this.selectedSex = (params['sex'] as SexFilter) || '';

        if (this.searchTerm.length >= 2) {
          this.triggerSearch();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  private loadCities(): void {
    this.isLoadingCities = true;
    // Bolivia countryId = 1 (adjust if needed)
    this.locationService.CitiesByCountry(1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cities) => {
          this.cities = cities;
          this.isLoadingCities = false;
        },
        error: () => {
          this.isLoadingCities = false;
        }
      });
  }

  private setupSearchPipeline(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      switchMap(() => {
        if (!this.searchTerm || this.searchTerm.length < 2) {
          this.searchResults = null;
          this.isLoading = false;
          return of(null);
        }

        this.isLoading = true;
        this.error = null;

        const query: SearchQuery = {
          term: this.searchTerm
        };

        if (this.selectedCityIds.length > 0) {
          query.cities = this.selectedCityIds;
        }

        if (this.selectedSex) {
          query.sex = this.selectedSex as 'M' | 'F';
        }

        return this.searchService.searchGeneral(query).pipe(
          catchError(err => {
            console.error('❌ Error en búsqueda:', err);
            this.error = 'Hubo un problema al conectar con el servidor.';
            this.isLoading = false;
            return of(null);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.isLoading = false;
      if (response && response.success && response.data) {
        this.searchResults = response.data;
      } else if (response !== null) {
        this.searchResults = null;
      }
    });
  }

  triggerSearch(): void {
    this.searchSubject.next();
  }

  onSexChange(sex: string): void {
    this.selectedSex = (sex as SexFilter) || '';
    this.updateQueryParams();
  }

  onCityToggle(cityId: number): void {
    const idx = this.selectedCityIds.indexOf(cityId);
    if (idx >= 0) {
      this.selectedCityIds = this.selectedCityIds.filter(id => id !== cityId);
    } else {
      this.selectedCityIds = [...this.selectedCityIds, cityId];
    }
    this.updateQueryParams();
  }

  isCitySelected(cityId: number): boolean {
    return this.selectedCityIds.includes(cityId);
  }

  clearFilters(): void {
    this.selectedSex = '';
    this.selectedCityIds = [];
    this.updateQueryParams();
  }

  hasActiveFilters(): boolean {
    return this.selectedSex !== '' || this.selectedCityIds.length > 0;
  }

  private updateQueryParams(): void {
    const queryParams: any = { term: this.searchTerm };
    if (this.selectedCityIds.length > 0) queryParams['cities'] = this.selectedCityIds.join(',');
    if (this.selectedSex) queryParams['sex'] = this.selectedSex;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
    // La suscripción a route.queryParams disparará triggerSearch()
  }

  // ─── Computed results ─────────────────────────────────────────────────────
  get providers(): ProviderSearchResult[] {
    return this.searchResults?.providers.results ?? [];
  }

  get totalFiltered(): number {
    const categories = this.searchResults?.categories.total ?? 0;
    return categories + (this.searchResults?.providers.total ?? 0);
  }

  get selectedCitiesLabel(): string {
    if (this.selectedCityIds.length === 0) return 'Todo Bolivia';
    if (this.selectedCityIds.length === 1) {
      const city = this.cities.find(c => c.id === this.selectedCityIds[0]);
      return city ? city.name : 'Ciudad seleccionada';
    }
    return `${this.selectedCityIds.length} ciudades`;
  }

  // ─── Navigation ─────────────────────────────────────────────────────────────
  onCategoryClick(category: CategorySearchResult): void {
    const routes: { [key: number]: string } = {
      3: '/professionals/specialty',
      2: '/professionals/category'
    };
    const targetRoute = routes[category.level] || '/categories';

    if (category.level === 1) {
      this.router.navigate([targetRoute], { state: { selectedCategoryId: category.id } });
    } else {
      this.router.navigate([targetRoute, category.id]);
    }
  }

  onProviderClick(provider: ProviderSearchResult): void {
    const route = provider.type === 'professional' ? '/professionals' : '/companies';
    this.router.navigate([route, provider.id]);
  }

  goBack(): void {
    this.navHistory.goBack('/');
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  getProviderInitials(provider: ProviderSearchResult): string {
    if (provider.type === 'company') {
      return (provider.companyName || provider.name || 'CO').substring(0, 2).toUpperCase();
    }
    const first = provider.name ? provider.name.charAt(0) : '';
    const last = provider.lastName ? provider.lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'PR';
  }

  photoURL(provider: ProviderSearchResult): string {
    if (provider.photoThumbnailUrl) return provider.photoThumbnailUrl;
    return 'assets/img/user-placeholder.png';
  }

  toggleMobileFilter(): void {
    this.isMobileFilterOpen = !this.isMobileFilterOpen;
  }

  getMinPrice(provider: ProviderSearchResult): string | null {
    const prices = provider.categories
      .map(c => c.priceMin)
      .filter((p): p is string => !!p)
      .map(Number);
    if (prices.length === 0) return null;
    return Math.min(...prices).toFixed(0);
  }

  getCoverageLabel(provider: ProviderSearchResult): string {
    if (provider.coversWholeCountry) return 'Todo Bolivia';
    const cities = provider.extraCities ?? [];
    if (cities.length === 0) return provider.location?.city ?? '';
    if (cities.length <= 2) return cities.map(c => c.name).join(', ');
    return `${cities.slice(0, 2).map(c => c.name).join(', ')} +${cities.length - 2}`;
  }

  trackByProvider(index: number, provider: ProviderSearchResult): number {
    return provider.id;
  }

  trackByCategory(index: number, category: CategorySearchResult): number {
    return category.id;
  }
}
