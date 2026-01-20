import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { AuthService } from '../../services/auth.service';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

// Importamos las interfaces correctas
import {
  SearchGeneralData,
  CategorySearchResult,
  ProviderSearchResult,
  SearchQuery
} from '../../interface/search.interface';

@Component({
  selector: 'app-hero-search',
  standalone: true, // Si usas standalone components (visto en tu código anterior)
  imports: [CommonModule],
  templateUrl: './hero-search.html',
  styleUrl: './hero-search.css',
})
export class HeroSearch implements OnChanges, OnInit {
  @Input() searchTerm: string = '';
  @Input() isOpen: boolean = false;
  @Input() selectedCityId: number | null = null;
  @Output() close = new EventEmitter<void>();

  searchResults: SearchGeneralData | null = null;
  isLoading: boolean = false;
  error: string | null = null;


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
      distinctUntilChanged(),
      switchMap(term => {

        // Validación básica
        if (!term || term.trim().length < 2) {
          return of(null);
        }

        this.isLoading = true;
        this.error = null;


        const query: SearchQuery = {
            term: term,
            city: this.selectedCityId || undefined, // Aquí va el number

        };

        return this.searchService.searchGeneral(query).pipe(
          catchError(error => {
            console.error('Error en búsqueda:', error);
            this.error = 'Error al buscar. Intenta nuevamente.';
            this.isLoading = false;
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
    // Ya no intentamos leer la ciudad string del AuthService,
    // porque ahora dependemos del selector del padre (HeroSolicitante).

    // OBTENER GPS (Si el navegador lo permite)
    // Esto sirve como fallback si el usuario no selecciona ciudad
    this.searchService.getCurrentPosition()
      .then(pos => {
        this.userLat = pos.coords.latitude;
        this.userLng = pos.coords.longitude;
      })
      .catch(() => {
        console.log('Ubicación GPS no disponible');
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 4. DETECCIÓN DE CAMBIOS
    // Si cambia el texto O si cambia la ciudad seleccionada en el padre
    if (changes['searchTerm'] || changes['selectedCityId']) {
      if (this.searchTerm && this.searchTerm.length >= 2) {
        this.searchSubject.next(this.searchTerm);
      }
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
      // Guardamos el ID en el estado para que la página de categorías lo lea
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
    // Aquí podrías navegar a una página de búsqueda avanzada pasando los parámetros
    // this.router.navigate(['/search'], { queryParams: { q: this.searchTerm, city: this.selectedCityId } });
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
      // executionTime eliminado ya que dijimos que el backend no lo enviaba
      categories: data.categories || { total: 0, results: [] },
      providers: data.providers || { total: 0, professionals: 0, companies: 0, results: [] },
      suggestions: data.suggestions || []
    };
  }
}
