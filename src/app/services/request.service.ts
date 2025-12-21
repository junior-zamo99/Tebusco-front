import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RequestResponse,
  CreateRequestDTO,
  UpdateRequestDTO,
  RequestFilterDTO,
  PaginationParams,
  PaginatedResponse,
  RequestStatusEnum,
  RequestStats
} from '../models/request.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = `${environment.apiUrl}/requests`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<RequestStats> {
    return this.http.get<RequestStats>(`${this.apiUrl}/stats`);
  }

  getRequestsByApplicant(
    applicantId: number,
    status: RequestStatusEnum,
    pagination?: PaginationParams
  ): Observable<PaginatedResponse<RequestResponse>> {

    let params = new HttpParams().set('status', status);

    if (pagination) {
      if (pagination.page) params = params.set('page', pagination.page);
      if (pagination.limit) params = params.set('limit', pagination.limit);
    }

    return this.http.get<PaginatedResponse<RequestResponse>>(
      `${this.apiUrl}/applicant/${applicantId}`,
      { params, withCredentials: true }
    );
  }

  getRequestsByProfessional(
    professionalId: number,
    status: RequestStatusEnum,
    pagination?: PaginationParams
  ): Observable<PaginatedResponse<RequestResponse>> {

    let params = new HttpParams().set('status', status);

    if (pagination) {
      if (pagination.page) params = params.set('page', pagination.page);
      if (pagination.limit) params = params.set('limit', pagination.limit);
    }

    return this.http.get<PaginatedResponse<RequestResponse>>(
      `${this.apiUrl}/professional/${professionalId}`,
      { params, withCredentials: true }
    );
  }

  getRequestsByCategory(categoryId: number): Observable<RequestResponse[]> {
    return this.http.get<RequestResponse[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  getAllRequests(filters?: RequestFilterDTO): Observable<RequestResponse[]> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<RequestResponse[]>(this.apiUrl, { params });
  }

  create(data: CreateRequestDTO): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(
      this.apiUrl,
      data,
      { withCredentials: true }
    );
  }

  getById(id: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  update(id: number, data: UpdateRequestDTO): Observable<RequestResponse> {
    return this.http.put<RequestResponse>(
      `${this.apiUrl}/${id}`,
      data,
      { withCredentials: true }
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  assignProfessional(requestId: number, professionalId: number): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(
      `${this.apiUrl}/${requestId}/assign`,
      { professionalId },
      { withCredentials: true }
    );
  }

  changeStatus(requestId: number, status: RequestStatusEnum): Observable<RequestResponse> {
    return this.http.patch<RequestResponse>(
      `${this.apiUrl}/${requestId}/${status}`,
      {},
      { withCredentials: true }
    );
  }
}
