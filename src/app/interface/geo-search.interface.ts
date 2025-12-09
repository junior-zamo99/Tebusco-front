// ===== REQUEST INTERFACES =====

export interface UserLocationInput {
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  country?: string;
  radiusKm?: number;
}

export interface GeoSearchQuery {
  term: string;
  userLocation?: UserLocationInput;
  categoryId?: number;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'score' | 'distance';
  sortOrder?: 'asc' | 'desc';
}

// ===== RESPONSE INTERFACES =====

export interface LocationMatch {
  matchType: 'same-city' | 'same-state' | 'same-country' | 'different-country';
  distance?: number;
  distanceText?: string;
  isNearby: boolean;
  badge: string;
}

export interface Scoring {
  locationScore: number;
  relevanceScore: number;
  subscriptionBonus: number;
  verificationBonus: number;
  totalScore: number;
  breakdown: string[];
}

export interface Location {
  city: string;
  state: string | null;
  country: string;
  lat?: number | null;
  lng?: number | null;
}

export interface Specialty {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  specialties: Specialty[];
}

export interface GeoProvider {
  type: 'professional' | 'company';
  id: number;
  name: string;
  lastName?: string;
  fullName: string;
  photoUrl: string | null;
  email: string;
  phone: string | null;
  categories: CategoryInfo[];
  location: Location | null;
  locationMatch?: LocationMatch;
  isVerified: boolean;
  status: string;
  hasActiveSubscription: boolean;
  scoring: Scoring;
  companyName?: string;
  nit?: string;
}

export interface GeoCategoryResult {
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

export interface GeoSearchData {
  query: string;
  userLocation?: UserLocationInput;
  totalResults: number;
  categories: {
    total: number;
    results: GeoCategoryResult[];
  };
  providers: {
    total: number;
    professionals: number;
    companies: number;
    results: GeoProvider[];
  };
  suggestions: string[];
}

export interface GeoSearchResponse {
  success: boolean;
  message: string;
  data: GeoSearchData;
}
