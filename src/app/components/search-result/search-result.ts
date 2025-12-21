import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';


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
  currentLocation: StorageUserAddress | null = null;

  isLoading: boolean = false;
  error: string | null = null;

  private searchSubject = new Subject<string>();
  private addressSubscription: Subscription | null = null;

  constructor(
    private searchService: SearchService,
    private storageService: StorageService,
    private addressDialogService: AddressDialogService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.addressSubscription = this.storageService.address$.subscribe(address => {
      this.currentLocation = address;
      console.log('Ubicación actualizada en buscador:', this.currentLocation);

      if (this.searchTerm && this.searchTerm.length >= 2) {
        this.searchSubject.next(this.searchTerm);
      }
    });

    // 2. Configurar el pipeline de búsqueda
    this.setupSearchPipeline();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] && this.searchTerm.length >= 2) {
      this.searchSubject.next(this.searchTerm);
    } else if (this.searchTerm.length < 2) {
      this.searchResults = null;
    }
  }

  ngOnDestroy(): void {
    if (this.addressSubscription) {
      this.addressSubscription.unsubscribe();
    }
    this.searchSubject.complete();
  }

  private setupSearchPipeline(): void {
    this.searchSubject.pipe(
      debounceTime(400),
      switchMap(term => {
        if (!this.currentLocation) {
          return of(null);
        }

        this.isLoading = true;
        this.error = null;

       const query: SearchQuery = {
            term: term,
            city: this.currentLocation.city,
            state: this.currentLocation.state || undefined,
            lat: Number(this.currentLocation.lat),
            lng: Number(this.currentLocation.lng)
        };

        return this.searchService.searchGeneral(query).pipe(
          catchError(err => {
            console.error('Error en búsqueda:', err);
            this.error = 'Hubo un problema al conectar con el servidor.';
            this.isLoading = false;
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

  async openAddressModalManual(): Promise<void> {
    const addressSelected = await this.addressDialogService.open();
    if (addressSelected) {
      // Al guardar, el storageService disparará el BehaviorSubject y se actualizará currentLocation
      this.storageService.saveMessageAddress('S');
    }
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
      return provider.companyName?.substring(0, 2).toUpperCase() || 'CO';
    }
    return `${provider.name.charAt(0)}${provider.lastName?.charAt(0) || ''}`.toUpperCase();
  }
}
