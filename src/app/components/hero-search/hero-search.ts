import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { GeoSearchService } from '../../services/geo-search.service';
import { SearchGeneralData, CategorySearchResult, ProviderSearchResult } from '../../interface/search.interface';
import { GeoSearchData } from '../../interface/geo-search.interface';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hero-search',
  imports: [CommonModule],
  templateUrl: './hero-search.html',
  styleUrl: './hero-search.css',
})
export class HeroSearch implements OnChanges, OnInit {
  @Input() searchTerm: string = '';
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  searchResults: SearchGeneralData | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  useGeoSearch: boolean = true;

  private searchSubject = new Subject<string>();

  constructor(
    private searchService: SearchService,
    private geoSearchService: GeoSearchService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.trim().length < 2) {
          return of(null);
        }
        this.isLoading = true;
        this.error = null;

        if (this.useGeoSearch) {
          return this.geoSearchService.quickSearch(term).pipe(
            catchError(error => {
              console.warn('Geo-search failed, falling back to regular search:', error);
              return this.searchService.searchGeneral(term);
            }),
            catchError(error => {
              this.error = 'Error al buscar. Intenta nuevamente.';
              return of(null);
            })
          );
        } else {
          return this.searchService.searchGeneral(term).pipe(
            catchError(error => {
              this.error = 'Error al buscar. Intenta nuevamente.';
              return of(null);
            })
          );
        }
      })
    ).subscribe(response => {
      this.isLoading = false;
      if (response && response.success) {
        this.searchResults = this.normalizeSearchResults(response.data);
      } else {
        this.searchResults = null;
      }
    });
  }

  ngOnInit(): void {
    if (this.useGeoSearch) {
      this.geoSearchService.getUserLocation();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      this.searchSubject.next(this.searchTerm);
    }
  }

  onCategoryClick(category: CategorySearchResult): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth-required']);
      this.closeResults();
      return;
    }

    if (category.level === 3) {
      this.router.navigate(['/professionals/specialty', category.id]);
    } else if (category.level === 2) {
      this.router.navigate(['/professionals/category', category.id]);
    } else {
      this.router.navigate(['/categories'], {
        state: { selectedCategoryId: category.id }
      });
    }

    this.closeResults();
  }

  onProviderClick(provider: ProviderSearchResult): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth-required']);
      this.closeResults();
      return;
    }

    if (provider.type === 'professional') {
      const categoryIds = provider.categories.map(cat => cat.id);
      this.router.navigate(['/professionals', provider.id], {
        queryParams: { categoryIds: categoryIds.join(',') }
      });
    } else {
      this.router.navigate(['/companies', provider.id]);
    }
    this.closeResults();
  }

  viewAllResults(): void {
   if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth-required']);
      this.closeResults();
      return;
    }
  }

  closeResults(): void {
    this.close.emit();
  }

  getProviderInitials(provider: ProviderSearchResult): string {
    if (provider.type === 'company') {
      return provider.companyName?.substring(0, 2).toUpperCase() || 'CO';
    }
    return `${provider.name.charAt(0)}${provider.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  hasLocationMatch(provider: any): boolean {
    return provider && typeof provider === 'object' && 'locationMatch' in provider;
  }

  getLocationMatch(provider: any): any {
    return this.hasLocationMatch(provider) ? provider.locationMatch : null;
  }

  private normalizeSearchResults(data: any): SearchGeneralData {
    if (data.categories && data.providers) {
      return data as SearchGeneralData;
    }

    return {
      query: data.query || '',
      totalResults: data.totalResults || 0,
      executionTime: '0ms',
      categories: data.categories || { total: 0, results: [] },
      providers: data.providers || { total: 0, professionals: 0, companies: 0, results: [] },
      suggestions: data.suggestions || []
    };
  }
}
