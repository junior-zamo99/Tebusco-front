import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  GeoSearchQuery,
  GeoSearchResponse,
  UserLocationInput
} from '../interface/geo-search.interface';

@Injectable({
  providedIn: 'root'
})
export class GeoSearchService {
  private apiUrl = `${environment.apiUrl}/geo-search`;
  private userLocationSubject = new BehaviorSubject<UserLocationInput | null>(null);
  public userLocation$ = this.userLocationSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeUserLocation();
  }

  /**
   * Inicializar ubicación del usuario al cargar el servicio
   */
  private initializeUserLocation(): void {
    this.getUserLocation();
  }

  /**
   * Obtener ubicación del usuario (GPS)
   */
  getUserLocation(): Promise<UserLocationInput | null> {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location: UserLocationInput = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            this.userLocationSubject.next(location);
            console.log('📍 Ubicación GPS obtenida:', location);
            resolve(location);
          },
          (error) => {
            console.warn('❌ No se pudo obtener GPS:', error.message);
            // Fallback: intentar obtener del localStorage o perfil del usuario
            const fallbackLocation = this.getFallbackLocation();
            this.userLocationSubject.next(fallbackLocation);
            resolve(fallbackLocation);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 300000 // 5 minutos
          }
        );
      } else {
        console.warn('❌ Geolocalización no disponible en este navegador');
        const fallbackLocation = this.getFallbackLocation();
        this.userLocationSubject.next(fallbackLocation);
        resolve(fallbackLocation);
      }
    });
  }

  /**
   * Obtener ubicación de respaldo (ciudad del perfil o localStorage)
   */
  private getFallbackLocation(): UserLocationInput | null {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        return JSON.parse(savedLocation);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Establecer ubicación manualmente (útil para perfil de usuario)
   */
  setUserLocation(location: UserLocationInput): void {
    this.userLocationSubject.next(location);
    localStorage.setItem('userLocation', JSON.stringify(location));
  }

  /**
   * Obtener ubicación actual sin actualizar el observable
   */
  getCurrentLocation(): UserLocationInput | null {
    return this.userLocationSubject.value;
  }

  /**
   * Búsqueda geolocalizada (GET con query params)
   */
  search(query: GeoSearchQuery): Observable<GeoSearchResponse> {
    let params = new HttpParams().set('term', query.term);

    // Agregar ubicación si existe
    if (query.userLocation) {
      if (query.userLocation.city) {
        params = params.set('city', query.userLocation.city);
      }
      if (query.userLocation.state) {
        params = params.set('state', query.userLocation.state);
      }
      if (query.userLocation.country) {
        params = params.set('country', query.userLocation.country);
      }
      if (query.userLocation.lat !== undefined && query.userLocation.lng !== undefined) {
        params = params.set('lat', query.userLocation.lat.toString());
        params = params.set('lng', query.userLocation.lng.toString());
      }
      if (query.userLocation.radiusKm) {
        params = params.set('radiusKm', query.userLocation.radiusKm.toString());
      }
    }

    // Agregar filtros opcionales
    if (query.categoryId !== undefined) {
      params = params.set('categoryId', query.categoryId.toString());
    }
    if (query.isVerified !== undefined) {
      params = params.set('isVerified', query.isVerified.toString());
    }
    if (query.page !== undefined) {
      params = params.set('page', query.page.toString());
    }
    if (query.limit !== undefined) {
      params = params.set('limit', query.limit.toString());
    }
    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }
    if (query.sortOrder) {
      params = params.set('sortOrder', query.sortOrder);
    }

    return this.http.get<GeoSearchResponse>(this.apiUrl, { params });
  }

  /**
   * Búsqueda usando POST (alternativa)
   */
  searchPost(query: GeoSearchQuery): Observable<GeoSearchResponse> {
    return this.http.post<GeoSearchResponse>(this.apiUrl, query);
  }

  /**
   * Búsqueda rápida con ubicación automática
   */
  quickSearch(term: string, options?: Partial<GeoSearchQuery>): Observable<GeoSearchResponse> {
    const currentLocation = this.getCurrentLocation();
    const query: GeoSearchQuery = {
      term,
      userLocation: currentLocation || undefined,
      page: 1,
      limit: 20,
      ...options
    };
    return this.search(query);
  }
}
