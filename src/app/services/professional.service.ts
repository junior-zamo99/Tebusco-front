import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// 🆕 Interfaces para tipado fuerte
export interface UpgradeToProfessionalRequest {
  name: string;
  lastName: string;
  phone: string;
  birthDate: string; // Formato: "YYYY-MM-DD"
}

export interface ProfessionalStatus {
  isProfessional: boolean;
  status: 'pending' | 'documents_uploaded' | 'payment_completed' | 'documents_approved' | 'active';
  currentStep: 'documents' | 'payment' | 'categories' | 'complete';
  canProceed: boolean;
  message: string;
  documentsUploaded: number;
  documentsRequired: number;
  documentsApproved: number;
  categoriesConfigured: number;
  hasActiveSubscription: boolean;
}

export interface ProfessionalDocument {
  id: number;
  documentType: 'ci_front' | 'ci_back' | 'selfie' | 'selfie_with_ci';
  status: 'pending' | 'uploaded' | 'approved' | 'rejected';
  fileId: number | null;
  fileName?: string;
  fileUrl?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ProfileCategory {
  categoryId: number;
  level: number;
  subcategories: number[];
}

export interface UpdateCategoryData {
  description?: string;
  experience?: number;
  priceMin?: number;
  isActive?: boolean;
  visible?: boolean;
  specialtyIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private apiUrl = `${environment.apiUrl}/professionals`;

  constructor(private http: HttpClient) {}


  upgradeToProfessional(data: UpgradeToProfessionalRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/upgrade`, data, {
      withCredentials: true
    });
  }


  getProfessionalStatus(): Observable<{ success: boolean; message: string; data: ProfessionalStatus }> {
    return this.http.get<{ success: boolean; message: string; data: ProfessionalStatus }>(
      `${this.apiUrl}/status`,
      { withCredentials: true }
    );
  }


  uploadDocument(
    professionalId: number,
    fileId: number,
    documentType: 'ci_front' | 'ci_back' | 'selfie' | 'selfie_with_ci'
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${professionalId}/documents`,
      { fileId, documentType },
      { withCredentials: true }
    );
  }


  getDocuments(professionalId: number): Observable<{ success: boolean; message: string; data: ProfessionalDocument[] }> {
    return this.http.get<{ success: boolean; message: string; data: ProfessionalDocument[] }>(
      `${this.apiUrl}/${professionalId}/documents`,
      { withCredentials: true }
    );
  }


  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      withCredentials: true
    });
  }

  getMeComplete(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me/complete`, {
      withCredentials: true
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, data, {
      withCredentials: true
    });
  }


  addCategoriesBulk(
    professionalId: number,
    categories: ProfileCategory[]
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${professionalId}/categories/bulk`,
      { categories },
      { withCredentials: true }
    );
  }


  updateCategory(
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

  getCategory(professionalId: number, categoryId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${professionalId}/categories/${categoryId}`,
      { withCredentials: true }
    );
  }


  getCategoriesGrouped(professionalId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${professionalId}/categories/grouped`,
      { withCredentials: true }
    );
  }


  deleteCategory(
    professionalId: number,
    profileCategoryId: number
  ): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}`,
      { withCredentials: true }
    );
  }


  getProfessionalById(professionalId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${professionalId}`, {
      withCredentials: true
    });
  }


  getDocumentTypes(): Observable<any> {
    console.warn('⚠️ getDocumentTypes() está deprecado. Los tipos de documento se manejan en el upgrade.');
    return this.http.get(`${this.apiUrl}/document-types`, {
      withCredentials: true
    });
  }
}
