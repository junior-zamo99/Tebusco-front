import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PublicProfessional,
  ProfessionalListResponse,
  PublicProfessionalProfile,
  PublicProfessionalWithSelectedProfiles,
  GetProfessionalsQuery,
  ApiResponse
} from '../interface/professional-public.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalPublicService {
  private apiUrl = `${environment.apiUrl}/professionals`;

  constructor(private http: HttpClient) {}


  getProfessionalById(professionalId: number): Observable<ApiResponse<PublicProfessional>> {
    return this.http.get<ApiResponse<PublicProfessional>>(
      `${this.apiUrl}/${professionalId}`
    );
  }


  searchProfessionals(query: GetProfessionalsQuery): Observable<ApiResponse<ProfessionalListResponse>> {
    let params = this.buildHttpParams(query);

    return this.http.get<ApiResponse<ProfessionalListResponse>>(
      this.apiUrl,
      { params }
    );
  }


  getProfessionalsByCategory(
    categoryId: number,
    query?: GetProfessionalsQuery
  ): Observable<ApiResponse<ProfessionalListResponse>> {
    let params = query ? this.buildHttpParams(query) : new HttpParams();

    return this.http.get<ApiResponse<ProfessionalListResponse>>(
      `${this.apiUrl}/category/${categoryId}`,
      { params }
    );
  }

  getProfessionalsBySpecialty(
    specialtyId: number,
    query?: GetProfessionalsQuery
  ): Observable<ApiResponse<ProfessionalListResponse>> {
    let params = query ? this.buildHttpParams(query) : new HttpParams();

    return this.http.get<ApiResponse<ProfessionalListResponse>>(
      `${this.apiUrl}/specialty/${specialtyId}`,
      { params }
    );
  }


  getProfessionalsByCategories(
    categoryIds: number[],
    query?: GetProfessionalsQuery
  ): Observable<ApiResponse<ProfessionalListResponse>> {
    let params = query ? this.buildHttpParams(query) : new HttpParams();
    params = params.set('categoryIds', categoryIds.join(','));

    return this.http.get<ApiResponse<ProfessionalListResponse>>(
      `${this.apiUrl}/filter`,
      { params }
    );
  }

  getProfessionalByProfileId(profileId: number): Observable<ApiResponse<PublicProfessionalProfile>> {
    return this.http.get<ApiResponse<PublicProfessionalProfile>>(
      `${this.apiUrl}/profile/${profileId}`
    );
  }


  getProfessionalWithCategories(
    professionalId: number,
    categoryIds: number[]
  ): Observable<ApiResponse<PublicProfessionalWithSelectedProfiles>> {
    const params = new HttpParams().set('categoryIds', categoryIds.join(','));

    return this.http.get<ApiResponse<PublicProfessionalWithSelectedProfiles>>(
      `${this.apiUrl}/${professionalId}/categories-with-professionals`,
      { params }
    );
  }


  private buildHttpParams(query: GetProfessionalsQuery): HttpParams {
    let params = new HttpParams();

    if (query.categoryId !== undefined) {
      params = params.set('categoryId', query.categoryId.toString());
    }
    if (query.specialtyId !== undefined) {
      params = params.set('specialtyId', query.specialtyId.toString());
    }
    if (query.city) {
      params = params.set('city', query.city);
    }
    if (query.minRating !== undefined) {
      params = params.set('minRating', query.minRating.toString());
    }
    if (query.maxPrice !== undefined) {
      params = params.set('maxPrice', query.maxPrice.toString());
    }
    if (query.isVerified !== undefined) {
      params = params.set('isVerified', query.isVerified.toString());
    }
    if (query.isPremium !== undefined) {
      params = params.set('isPremium', query.isPremium.toString());
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

    return params;
  }
}
