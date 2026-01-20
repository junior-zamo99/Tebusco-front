
export interface SearchQuery {
  term: string;
  city?: number;
  cities?: number[];
  sex?: 'M' | 'F';
}

export interface CategorySearchResult {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isTop: boolean;
  level: number;
  professionalsCount: number;
  companiesCount: number;
  parent: {
    id: number;
    name: string;
  } | null;
  children: {
    id: number;
    name: string;
    professionalsCount: number;
  }[];
  relevanceScore: number;
}

export interface ProviderSearchResult {
  type: 'professional' | 'company';
  id: number;
  name: string;
  lastName?: string;
  fullName: string;
  photoUrl: string | null;
  email: string;
  phone: string | null;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  location: {
    city: string;
    state: string | null;
    country: string;
  } | null;
  isVerified: boolean;
  status: string;
  hasActiveSubscription: boolean;
  nit?: string;
  companyName?: string;
  rating?: number;
  isPromocional?: boolean;
  reviewsCount?: number;
  relevanceScore: number;
  distanceInMeters?: number;
}

// 4. Estructura de DATOS (lo que viene dentro de 'data' en la respuesta JSON)
export interface SearchGeneralData {
  query: string;
  totalResults: number;
  // executionTime: string; // ELIMINADO: Tu backend no envía esto
  categories: {
    total: number;
    results: CategorySearchResult[];
  };
  providers: {
    total: number;
    professionals: number;
    companies: number;
    results: ProviderSearchResult[];
  };
  suggestions?: string[];
}

export interface SearchCategoriesData {
  query: string;
  total: number;
  results: CategorySearchResult[];
}

export interface SearchProvidersData {
  query: string;
  total: number;
  professionals: number;
  companies: number;
  results: ProviderSearchResult[];
}

// 5. Respuestas completas de la API
export interface SearchGeneralResponse {
  success: boolean;
  message: string;
  data: SearchGeneralData;
}

export interface SearchCategoriesResponse {
  success: boolean;
  message: string;
  data: SearchCategoriesData;
}

export interface SearchProvidersResponse {
  success: boolean;
  message: string;
  data: SearchProvidersData;
}
