import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, switchMap, catchError, distinctUntilChanged } from 'rxjs/operators';


import { SearchService } from '../../services/search.service';
import { StorageService, StorageUserAddress } from '../../services/storage.service';
import { AddressDialogService } from '../../services/address-dialog.service';
import { AuthService } from '../../services/auth.service';


import {
  SearchGeneralData,
  CategorySearchResult,
  ProviderSearchResult,
  SearchQuery
} from '../../interface/search.interface';

@Component({
  selector: 'app-search-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-result.html',
  styleUrl: './search-result.css',
})
export class SearchResult implements OnInit, OnChanges, OnDestroy {
  @Input() searchTerm: string = '';
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  searchResults: SearchGeneralData | null = null;

  cityName: string = '';

  isLoading: boolean = false;
  error: string | null = null;

  private searchSubject = new Subject<string>();

  constructor(
    private searchService: SearchService,
    private storageService: StorageService,
    private addressDialogService: AddressDialogService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const applicant = this.storageService.getApplicant();
    if (applicant && applicant.city) {
        this.cityName = applicant.city.name;
    }

    this.setupSearchPipeline();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm']) {
      if (this.searchTerm && this.searchTerm.length >= 2) {
        this.searchSubject.next(this.searchTerm);
      } else {
        this.searchResults = null;
        this.isLoading = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  private setupSearchPipeline(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(term => {

        const applicant = this.storageService.getApplicant();

        if (!applicant || !applicant.city || !applicant.city.id) {
          console.warn('⚠️ El solicitante no tiene una ciudad configurada con ID.');
          return of(null);
        }

        this.isLoading = true;
        this.error = null;

        const query: SearchQuery = {
            term: term,
            city: applicant.city.id,

        };

        return this.searchService.searchGeneral(query).pipe(
          catchError(err => {
            console.error('❌ Error en búsqueda:', err);
            this.error = 'Hubo un problema al conectar con el servidor.';
            this.isLoading = false;
            return of(null);
          })
        );
      })
    ).subscribe(response => {
      this.isLoading = false;
      if (response && response.success && response.data) {
        this.searchResults = response.data;
      } else {
        this.searchResults = null;
      }
    });
  }


  async openAddressModalManual(): Promise<void> {
     await this.addressDialogService.open();
  }


  onCategoryClick(category: CategorySearchResult): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth-required']);
      this.closeResults();
      return;
    }
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
    this.closeResults();
  }

  onProviderClick(provider: ProviderSearchResult): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth-required']);
      this.closeResults();
      return;
    }
    const route = provider.type === 'professional' ? '/professionals' : '/companies';
    this.router.navigate([route, provider.id]);
    this.closeResults();
  }

  closeResults(): void {
    this.close.emit();
  }

  getProviderInitials(provider: ProviderSearchResult): string {
    if (provider.type === 'company') {
      return (provider.companyName || provider.name || 'CO').substring(0, 2).toUpperCase();
    }
    const first = provider.name ? provider.name.charAt(0) : '';
    const last = provider.lastName ? provider.lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'PRO';
  }

  viewAllResults(): void {
   if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth-required']);
      this.closeResults();
      return;
    }
  }
}
