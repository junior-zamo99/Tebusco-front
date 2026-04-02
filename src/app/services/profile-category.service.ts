import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Inputs para bulk save ────────────────────────────────────────────────────

export interface PortfolioPhotoInput {
  imageUrl: string;
  imageMediumUrl?: string;
  imageThumbnailUrl?: string;
  caption?: string;
  order?: number;
}

export interface CertificateInput {
  title: string;
  description?: string;
  issuedAt?: string; // 'YYYY-MM-DD'
  fileUrl: string;
}

export interface CategorySelectionData {
  categoryId: number;
  level: 2;
  subcategories: number[];
  description?: string;
  slogan?: string;
  experience?: number;
  priceMin?: number;
  portfolioPhotos?: PortfolioPhotoInput[];
  certificates?: CertificateInput[];
  cv?: CvInput | null;
}

export interface SaveMultipleCategoriesRequest {
  categories: CategorySelectionData[];
}

// ── Respuestas de portfolio y certificados ───────────────────────────────────

export interface PortfolioPhoto {
  id: number;
  imageUrl: string;
  imageMediumUrl?: string;
  imageThumbnailUrl?: string;
  caption?: string;
  order: number;
  createdAt: string;
}

export interface CategoryCertificate {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  status: 'uploaded' | 'approved' | 'rejected';
  issuedAt?: string;
  createdAt: string;
}

export interface ProfileCategoryCV {
  id: number;
  fileUrl: string;
  status: 'uploaded' | 'approved' | 'rejected';
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface CvInput {
  fileUrl?: string;
  fileId?: number;
}

// ── Respuestas de categorías guardadas ───────────────────────────────────────

export interface SavedCategory {
  id: number; // profileCategoryId
  category: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string | null;
    level: number;
  };
  description: string | null;
  slogan: string | null;
  experience: number | null;
  priceMin: number | null;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  subcategories: any[];
  portfolioPhotos: any[];
  certificates: any[];
}

export interface SavedCategoriesResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    totalLevel2: number;
    totalLevel3: number;
    categories: SavedCategory[];
  };
}

// ── Categoría agrupada (respuesta enriquecida del backend) ───────────────────

export interface GroupedSubcategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  level: 3;
  description: string | null;
  experience: number | null;
  priceMin: number | null;
}

export interface GroupedCategory {
  id: number;
  category: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string | null;
    level: 2;
  };
  description: string | null;
  slogan: string | null;
  experience: number | null;
  priceMin: number | null;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  visible: boolean;
  subcategories: GroupedSubcategory[];
  portfolioPhotos: PortfolioPhoto[];
  certificates: CategoryCertificate[];
  cv: ProfileCategoryCV | null;
}

export interface UpdateCategoryData {
  description?: string;
  slogan?: string;
  experience?: number;
  priceMin?: number;
  isActive?: boolean;
  visible?: boolean;
  specialtyIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileCategoryService {
  private apiUrl = `${environment.apiUrl}/professionals`;

  constructor(private http: HttpClient) {}

  // ── Bulk save ──────────────────────────────────────────────────────────────

  saveMultipleCategories(
    professionalId: number,
    categoriesData: CategorySelectionData[]
  ): Observable<SavedCategoriesResponse> {
    return this.http.post<SavedCategoriesResponse>(
      `${this.apiUrl}/${professionalId}/categories/bulk`,
      { categories: categoriesData },
      { withCredentials: true }
    );
  }

  // ── Categorías ─────────────────────────────────────────────────────────────

  getProfileCategoriesGrouped(
    professionalId: number
  ): Observable<{ success: boolean; data: GroupedCategory[] }> {
    return this.http.get<{ success: boolean; data: GroupedCategory[] }>(
      `${this.apiUrl}/${professionalId}/categories/grouped`,
      { withCredentials: true }
    );
  }

  getProfileCategories(professionalId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${professionalId}/categories`,
      { withCredentials: true }
    );
  }

  getProfileCategoryById(
    professionalId: number,
    profileCategoryId: number
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}`,
      { withCredentials: true }
    );
  }

  updateProfileCategory(
    professionalId: number,
    profileCategoryId: number,
    data: UpdateCategoryData
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}`,
      data,
      { withCredentials: true }
    );
  }

  deleteProfileCategory(
    professionalId: number,
    profileCategoryId: number
  ): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}`,
      { withCredentials: true }
    );
  }

  // ── Portfolio por categoría ────────────────────────────────────────────────

  getPortfolio(professionalId: number, profileCategoryId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}/portfolio`,
      { withCredentials: true }
    );
  }

  addPhoto(professionalId: number, profileCategoryId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}/portfolio`,
      formData,
      { withCredentials: true }
    );
  }

  reorderPhotos(professionalId: number, profileCategoryId: number, order: { id: number; order: number }[]): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}/portfolio/reorder`,
      { order },
      { withCredentials: true }
    );
  }

  deletePhoto(professionalId: number, profileCategoryId: number, photoId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}/portfolio/${photoId}`,
      { withCredentials: true }
    );
  }

  // ── Certificados por categoría ─────────────────────────────────────────────

  getCertificates(professionalId: number, profileCategoryId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}/certificates`,
      { withCredentials: true }
    );
  }

  addCertificate(professionalId: number, profileCategoryId: number, file: File, title: string, description?: string, issuedAt?: string): Observable<any> {
    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('title', title);
    if (description) formData.append('description', description);
    if (issuedAt) formData.append('issuedAt', issuedAt);
    return this.http.post(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}/certificates`,
      formData,
      { withCredentials: true }
    );
  }

  deleteCertificate(professionalId: number, profileCategoryId: number, certId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}/certificates/${certId}`,
      { withCredentials: true }
    );
  }

  // ── CV por categoría ──────────────────────────────────────────────────────

  uploadCv(professionalId: number, profileCategoryId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cv', file);
    return this.http.post(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}/cv`,
      formData,
      { withCredentials: true }
    );
  }

  getCv(professionalId: number, profileCategoryId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}/cv`,
      { withCredentials: true }
    );
  }

  deleteCv(professionalId: number, profileCategoryId: number, cvId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}/cv/${cvId}`,
      { withCredentials: true }
    );
  }

  // ── Helpers de validación ──────────────────────────────────────────────────

  validateCategoryData(data: UpdateCategoryData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (data.description && data.description.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }
    if (data.experience !== undefined && (data.experience < 0 || data.experience > 50)) {
      errors.push('La experiencia debe estar entre 0 y 50 años');
    }
    if (data.priceMin !== undefined && data.priceMin < 0) {
      errors.push('El precio mínimo no puede ser negativo');
    }
    return { valid: errors.length === 0, errors };
  }
}
