import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { AuthService } from '../../services/auth.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

// Importamos las interfaces correctas
import {
  SearchGeneralData,
  CategorySearchResult,
  ProviderSearchResult,
  SearchQuery
} from '../../interface/search.interface';

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


  userCity: string = 'Santa Cruz de la Sierra';
  userLat?: number;
  userLng?: number;

  private searchSubject = new Subject<string>();

  constructor(
    private searchService: SearchService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      switchMap(term => {
        if (!term || term.trim().length < 2) {
          return of(null);
        }
        this.isLoading = true;
        this.error = null;

        const query: SearchQuery = {
            term: term,
            city: this.userCity,
            lat: this.userLat,
            lng: this.userLng
        };

        return this.searchService.searchGeneral(query).pipe(
          catchError(error => {
            console.error('Error en búsqueda:', error);
            this.error = 'Error al buscar. Intenta nuevamente.';
            this.isLoading = false; // Apagamos loading en error
            return of(null);
          })
        );
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
    const currentUserAddres = this.authService.currentAddresses();
    if (currentUserAddres && currentUserAddres.city) {
        this.userCity = currentUserAddres.city;
    }

    // 2. OBTENER GPS (Si el navegador lo permite)
    this.searchService.getCurrentPosition()
      .then(pos => {
        this.userLat = pos.coords.latitude;
        this.userLng = pos.coords.longitude;

        // Si ya había un término escrito, relanzamos la búsqueda con la nueva precisión GPS
        if (this.searchTerm && this.searchTerm.length >= 2) {
            this.searchSubject.next(this.searchTerm);
        }
      })
      .catch(() => {
        console.log('Ubicación GPS no disponible, usando ciudad base:', this.userCity);
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
      // Simplificado: Solo enviamos el ID para ir al perfil
      this.router.navigate(['/professionals', provider.id]);
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
    // Implementar navegación a página de resultados completa si lo deseas
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

  // Normalizamos para asegurar que la estructura sea segura para el template
  private normalizeSearchResults(data: any): SearchGeneralData {
    return {
      query: data.query || '',
      totalResults: data.totalResults || 0,
      executionTime: data.executionTime || '0ms',
      categories: data.categories || { total: 0, results: [] },
      providers: data.providers || { total: 0, professionals: 0, companies: 0, results: [] },
      suggestions: data.suggestions || []
    };
  }
}
