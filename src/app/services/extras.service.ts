import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ========================================
// 📋 INTERFACES BASE
// ========================================

export interface ExtraFeature {
  id: number;
  name: string;
  key: string;
  displayName: string;
  isAccumulable: boolean;
}

export interface ExtraPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  isActive: boolean;
  sortOrder: number;
  featureId: number;
  feature: ExtraFeature;
}

export interface SelectedExtra {
  packageId: number;
  quantity: number;
  name: string;
  price: number;
  totalPrice: number;
}

export interface ExtrasResponse {
  success: boolean;
  data: ExtraPackage[];
  message: string;
}

// ========================================
// 🛒 INTERFACES DE COMPRA
// ========================================

export interface PurchaseRequest {
  packageId: number;
  paymentMethodId: number;
  quantity?: number;
  externalReference?: string;
  couponCode?: string;
  useCreditAmount?: number;
}

export interface PurchasedExtra {
  id: number;
  subscriptionId: number;
  packageId: number;
  quantity: number;
  pricePaid: number;
  currency: string;
  status: string;
  purchasedAt: string;
  expiresAt: string;
}

export interface PurchaseTransaction {
  id: number;
  subscriptionId: number;
  type: string;
  amount: number;
  currency: string;
  paymentMethodId: number;
  status: string;
  externalReference?: string;
  metadata: any;
  completedAt: string;
}

// ========================================
// 🏙️ INTERFACES DE CITY EXTRAS
// ========================================

export interface CityInfo {
  id: number;
  name: string;
  code: string;
  country?: CountryInfo;
}

export interface CountryInfo {
  id: number;
  name: string;
  code: string;
  citiesCount?: number;
}

export type CityExtraType = 'single_city' | 'multi_city' | 'national';
export type CityExtraNextStep = 'select_cities' | 'select_country';

export interface CityExtraInfo {
  isCityExtra: boolean;
  extraType: CityExtraType;
  maxCities: number;
  nextStep: CityExtraNextStep;
  availableCities: CityInfo[] | null;
  availableCountries: CountryInfo[] | null;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: {
    purchasedExtra: PurchasedExtra;
    transaction: PurchaseTransaction;
    updatedLimit: number;
    cityExtraInfo?: CityExtraInfo;
  };
}

// ========================================
// 🗺️ INTERFACES DE SELECCIÓN DE CIUDADES
// ========================================

export interface SelectCitiesRequest {
  purchasedExtraId: number;
  cityIds: number[];
}

export interface SelectNationalRequest {
  purchasedExtraId: number;
  countryId: number;
}

export interface PurchasedExtraDetail {
  id: number;
  packageName: string;
  extraType: CityExtraType;
  maxCities: number;
  usedCities: number;
  remainingCities: number;
  cities: CityInfo[];
  expiresAt: string;
  isConfigured: boolean;
}

export interface CoverageInfo {
  professionalId: number;
  primaryCity: CityInfo | null;
  extraCities: CityInfo[];
  hasNationalCoverage: boolean;
  nationalCountry: CountryInfo | null;
  purchasedExtras: PurchasedExtraDetail[];
  totalCitiesCovered: number;
}

export interface SelectCitiesResponse {
  success: boolean;
  message: string;
  data: {
    purchasedExtraId: number;
    selectedCities: CityInfo[];
    remainingSlots: number;
    coverage: CoverageInfo;
  };
}

export interface CoverageResponse {
  success: boolean;
  message: string;
  data: CoverageInfo;
}

// ========================================
// 📍 INTERFACES DE CIUDADES DISPONIBLES
// ========================================

export interface CountryWithCities {
  id: number;
  name: string;
  code: string;
  citiesCount: number;
  cities: CityInfo[];
}

export interface CurrentCoverage {
  primaryCityId: number | null;
  extraCityIds: number[];
  nationalCountryId: number | null;
}

export interface AvailableCitiesResponse {
  success: boolean;
  message: string;
  data: {
    countries: CountryWithCities[];
    currentCoverage: CurrentCoverage;
  };
}

// ========================================
// ⏳ INTERFACES DE EXTRAS PENDIENTES
// ========================================

export interface PendingExtra {
  purchasedExtraId: number;
  packageName: string;
  extraType: CityExtraType;
  maxCities: number;
  configuredCities: number;
  remainingCities: number;
  needsConfiguration: boolean;
  configurationType: 'cities' | 'country';
  expiresAt: string;
}

export interface PendingExtrasResponse {
  success: boolean;
  message: string;
  data: PendingExtra[];
}

// ========================================
// 🔧 CONSTANTES Y UTILIDADES
// ========================================

export const CITY_EXTRA_KEYS = ['extra_city_1', 'extra_city_3', 'national_visibility'];

export function isCityExtraPackage(pkg: ExtraPackage): boolean {
  return CITY_EXTRA_KEYS.includes(pkg.feature.key);
}

export function getCityExtraType(featureKey: string): CityExtraType | null {
  if (featureKey === 'extra_city_1') return 'single_city';
  if (featureKey === 'extra_city_3') return 'multi_city';
  if (featureKey === 'national_visibility') return 'national';
  return null;
}

// ========================================
// 🎯 SERVICIO DE EXTRAS
// ========================================

@Injectable({
  providedIn: 'root'
})
export class ExtrasService {
  private apiUrl = `${environment.apiUrl}/extras`;

  constructor(private http: HttpClient) {}

  // ========================================
  // 📦 PAQUETES
  // ========================================

  /**
   * 📦 Obtener lista de paquetes extra disponibles
   * GET /extras/packages
   */
  getPackages(): Observable<ExtrasResponse> {
    return this.http.get<ExtrasResponse>(`${this.apiUrl}/packages`, {
      withCredentials: true
    });
  }

  // ========================================
  // 🛒 COMPRA
  // ========================================

  /**
   * 🛒 Comprar un paquete extra
   * POST /extras/purchase
   *
   * @param data - Datos de la compra
   * @returns Observable con resultado de compra (puede incluir cityExtraInfo)
   */
  purchasePackage(data: PurchaseRequest): Observable<PurchaseResponse> {
    console.log('🛒 Comprando extra:', data);
    return this.http.post<PurchaseResponse>(`${this.apiUrl}/purchase`, data, {
      withCredentials: true
    });
  }

  // ========================================
  // 🏙️ CITY EXTRAS - SELECCIÓN
  // ========================================

  /**
   * 📍 Seleccionar ciudades para un extra de tipo city
   * POST /extras/city/select-cities
   *
   * @param purchasedExtraId - ID del extra comprado
   * @param cityIds - IDs de las ciudades a seleccionar
   * @returns Observable con resultado de selección
   */
  selectCities(purchasedExtraId: number, cityIds: number[]): Observable<SelectCitiesResponse> {
    const body: SelectCitiesRequest = { purchasedExtraId, cityIds };
    console.log('📍 Seleccionando ciudades:', body);
    return this.http.post<SelectCitiesResponse>(
      `${this.apiUrl}/city/select-cities`,
      body,
      { withCredentials: true }
    );
  }

  /**
   * 🌎 Seleccionar cobertura nacional
   * POST /extras/city/select-national
   *
   * @param purchasedExtraId - ID del extra comprado
   * @param countryId - ID del país para cobertura nacional
   * @returns Observable con resultado de selección
   */
  selectNational(purchasedExtraId: number, countryId: number): Observable<SelectCitiesResponse> {
    const body: SelectNationalRequest = { purchasedExtraId, countryId };
    console.log('🌎 Seleccionando cobertura nacional:', body);
    return this.http.post<SelectCitiesResponse>(
      `${this.apiUrl}/city/select-national`,
      body,
      { withCredentials: true }
    );
  }

  // ========================================
  // 🗺️ CITY EXTRAS - CONSULTAS
  // ========================================

  /**
   * 🗺️ Obtener cobertura actual del profesional
   * GET /extras/city/coverage
   *
   * @returns Observable con información de cobertura
   */
  getCoverage(): Observable<CoverageResponse> {
    return this.http.get<CoverageResponse>(
      `${this.apiUrl}/city/coverage`,
      { withCredentials: true }
    );
  }

  /**
   * 📍 Obtener ciudades disponibles para seleccionar
   * GET /extras/city/available
   *
   * @returns Observable con países y ciudades disponibles
   */
  getAvailableCities(): Observable<AvailableCitiesResponse> {
    return this.http.get<AvailableCitiesResponse>(
      `${this.apiUrl}/city/available`,
      { withCredentials: true }
    );
  }

  /**
   * ⏳ Obtener extras pendientes de configurar
   * GET /extras/city/pending
   *
   * @returns Observable con lista de extras sin configurar
   */
  getPendingExtras(): Observable<PendingExtrasResponse> {
    return this.http.get<PendingExtrasResponse>(
      `${this.apiUrl}/city/pending`,
      { withCredentials: true }
    );
  }

  // ========================================
  // 🔧 UTILIDADES
  // ========================================

  /**
   * 🔍 Verificar si un paquete es de tipo City Extra
   */
  isCityExtra(pkg: ExtraPackage): boolean {
    return isCityExtraPackage(pkg);
  }

  /**
   * 🏷️ Obtener el tipo de City Extra basado en la feature key
   */
  getCityExtraType(pkg: ExtraPackage): CityExtraType | null {
    return getCityExtraType(pkg.feature.key);
  }

  /**
   * 📊 Calcular total de extras seleccionados
   */
  calculateExtrasTotal(extras: SelectedExtra[]): number {
    return extras.reduce((total, extra) => total + extra.totalPrice, 0);
  }
}
