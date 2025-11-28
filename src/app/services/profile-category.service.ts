import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// 🆕 Interfaces actualizadas
export interface CategorySelectionData {
  categoryId: number;
  level: 2; // Solo nivel 2 (categorías principales)
  subcategories: number[]; // IDs de nivel 3 (especialidades)
}

export interface SaveMultipleCategoriesRequest {
  categories: CategorySelectionData[];
}

export interface SavedCategory {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  status: 'pending' | 'approved' | 'rejected';
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
  experience: number | null;
  priceMin: number | null;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  visible: boolean;
  subcategories: GroupedSubcategory[];
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
export class ProfileCategoryService {
  private apiUrl = `${environment.apiUrl}/professionals`;

  constructor(private http: HttpClient) {}

  /**
   * 📍 PASO 16: Configurar Categorías de Servicio (Bulk)
   * POST /professionals/{professionalId}/categories/bulk
   * Guarda múltiples categorías a la vez
   * @param professionalId ID del profesional
   * @param categoriesData Array de categorías con subcategorías
   */
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

  /**
   * 📁 Ver Categorías Agrupadas
   * GET /professionals/{professionalId}/categories/grouped
   * Obtiene categorías organizadas jerárquicamente (nivel 2 con sus nivel 3)
   */
  getProfileCategoriesGrouped(
    professionalId: number
  ): Observable<{ success: boolean; data: GroupedCategory[] }> {
    return this.http.get<{ success: boolean; data: GroupedCategory[] }>(
      `${this.apiUrl}/${professionalId}/categories/grouped`,
      { withCredentials: true }
    );
  }

  /**
   * Ver todas las categorías del profesional (sin agrupar)
   * GET /professionals/{professionalId}/categories
   */
  getProfileCategories(professionalId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${professionalId}/categories`,
      { withCredentials: true }
    );
  }

  /**
   * Ver una categoría específica del perfil
   * GET /professionals/{professionalId}/categories/{profileCategoryId}
   */
  getProfileCategoryById(
    professionalId: number,
    profileCategoryId: number
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${professionalId}/categories/${profileCategoryId}`,
      { withCredentials: true }
    );
  }

  /**
   * 📍 PASO 17: Actualizar Perfil de Categoría
   * PUT /professionals/{professionalId}/categories/{profileCategoryId}
   * Agrega descripción, experiencia y precio a una categoría
   */
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

  /**
   * 🛡️ Validar límite de categorías según plan
   * @param currentCount Cantidad actual de categorías
   * @param planLimit Límite del plan
   * @param newCategories Cantidad de nuevas categorías a agregar
   */
  canAddCategories(
    currentCount: number,
    planLimit: number,
    newCategories: number = 1
  ): { canAdd: boolean; remaining: number; error?: string } {
    const remaining = planLimit - currentCount;
    const canAdd = remaining >= newCategories;

    return {
      canAdd,
      remaining,
      error: !canAdd ? `Solo puedes agregar ${remaining} categoría(s) más` : undefined
    };
  }

  /**
   * 📊 Validar datos de categoría antes de enviar
   */
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

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
