export interface Location {
  city: string;
  state?: string | null;
  country: string;
  address?: string | null;
  fullAddress?: string | null;
  lat: number;
  lng: number;
  label: string;
}

export interface LocationListItem {
  city: string;
  country: string;
}

export interface Specialty {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface MainCategory {
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface Subscription {
  planCode: string;
  planName: string;
  isPremium: boolean;
}

export interface PublicDocument {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
}

export interface PublicDocuments {
  cv: PublicDocument | null;
  certificates: PublicDocument[];
}

export interface ProfileCategory {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryImageUrl: string | null;
  description: string | null;
  experience: number | null;
  priceMin: number | null;
  isVerified: boolean;
  specialties: Specialty[];
  categoryRating?: number;
  categoryReviewsCount?: number;
}

export interface ProfessionalStats {
  activeCategories: number;
  averageResponseTime?: string;
  completionRate?: number;
}

export interface ProfessionalStatsWithSelection {
  totalCategories: number;
  selectedCategories: number;
}

export interface PublicProfessional {
  id: number;
  fullName: string;
  photoUrl: string | null;
  isVerified: boolean;
  yearsOfExperience?: number;
  rating?: number;
  reviewsCount?: number;
  completedJobsCount?: number;
  location: Location | null;
  categories: ProfileCategory[];
  subscription: Subscription | null;
  publicDocuments: PublicDocuments;
  stats: ProfessionalStats;
  createdAt: Date;
}

export interface ProfessionalListItem {
  id: number;
  fullName: string;
  photoUrl: string | null;
  isVerified: boolean;
  rating?: number;
  reviewsCount?: number;
  location: LocationListItem | null;
  mainCategory: MainCategory;
  priceMin: number | null;
  isPremium: boolean;
  specialties: string[];
  description: string | null;
}

export interface ProfessionalListResponse {
  professionals: ProfessionalListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categoryId?: number;
    categoryName?: string;
    specialtyId?: number;
    specialtyName?: string;
    location?: string;
  };
}

export interface PublicProfessionalProfile {
  professionalId: number;
  fullName: string;
  photoUrl: string | null;
  email: string;
  phone: string | null;
  isVerified: boolean;
  location: Location | null;
  profile: {
    id: number;
    category: Category;
    description: string | null;
    experience: number | null;
    priceMin: number | null;
    isVerified: boolean;
    specialties: Specialty[];
  };
  subscription: Subscription | null;
  publicDocuments: PublicDocuments;
  createdAt: Date;
}

export interface PublicProfessionalWithSelectedProfiles {
  id: number;
  fullName: string;
  photoUrl: string | null;
  email: string;
  phone: string | null;
  isVerified: boolean;
  location: Location | null;
  profiles: ProfileCategory[];
  subscription: Subscription | null;
  publicDocuments: PublicDocuments;
  stats: ProfessionalStatsWithSelection;
  createdAt: Date;
}

// Parámetros de búsqueda
export interface GetProfessionalsQuery {
  categoryId?: number;
  specialtyId?: number;
  city?: string;
  minRating?: number;
  maxPrice?: number;
  isVerified?: boolean;
  isPremium?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'price' | 'reviews' | 'created';
  sortOrder?: 'asc' | 'desc';
}


export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
