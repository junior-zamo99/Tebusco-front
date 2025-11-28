import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { SearchGeneralData, CategorySearchResult, ProviderSearchResult } from '../../interface/search.interface';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hero-search',
  imports: [CommonModule],
  templateUrl: './hero-search.html',
  styleUrl: './hero-search.css',
})
export class HeroSearch implements OnChanges {
  @Input() searchTerm: string = '';
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  searchResults: SearchGeneralData | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  private searchSubject = new Subject<string>();

  constructor(
    private searchService: SearchService,
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
        return this.searchService.searchGeneral(term).pipe(
          catchError(error => {
            this.error = 'Error al buscar. Intenta nuevamente.';
            return of(null);
          })
        );
      })
    ).subscribe(response => {
      this.isLoading = false;
      if (response && response.success) {
        this.searchResults = response.data;
      } else {
        this.searchResults = null;
      }
    });
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
    this.router.navigate(['/search'], {
      queryParams: { q: this.searchTerm }
    });
    this.closeResults();
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
}
