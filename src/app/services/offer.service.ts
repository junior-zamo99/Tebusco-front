import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OfferResponse,
  CreateOfferDTO,
  UpdateOfferDTO,
  OfferHistoryType,
  PaginationMeta
} from '../models/offer.model';
import { environment } from '../../environments/environment';

export interface PaginatedOfferResponse {
  success: boolean;
  message: string;
  data: OfferResponse[];
  pagination: PaginationMeta;
}

export interface SingleOfferResponse {
  success: boolean;
  message: string;
  data: OfferResponse;
}

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = `${environment.apiUrl}/offers`;

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<SingleOfferResponse> {
    return this.http.get<SingleOfferResponse>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  getMyOfferForRequest(requestId: number): Observable<SingleOfferResponse> {
    return this.http.get<SingleOfferResponse>(
      `${this.apiUrl}/professional/request/${requestId}/my-offer`,
      { withCredentials: true }
    );
  }

  postulate(data: CreateOfferDTO): Observable<SingleOfferResponse> {
    return this.http.post<SingleOfferResponse>(
      `${this.apiUrl}/professional/postulate`,
      data,
      { withCredentials: true }
    );
  }

  getMyHistory(
    type: OfferHistoryType = 'active',
    pagination?: { page?: number; limit?: number }
  ): Observable<PaginatedOfferResponse> {
    let params = new HttpParams().set('type', type);
    if (pagination?.page) params = params.set('page', pagination.page);
    if (pagination?.limit) params = params.set('limit', pagination.limit);

    return this.http.get<PaginatedOfferResponse>(
      `${this.apiUrl}/professional/my-history`,
      { params, withCredentials: true }
    );
  }

  editOffer(id: number, data: UpdateOfferDTO): Observable<SingleOfferResponse> {
    return this.http.patch<SingleOfferResponse>(
      `${this.apiUrl}/professional/${id}/edit`,
      data,
      { withCredentials: true }
    );
  }

  cancelOffer(id: number): Observable<SingleOfferResponse> {
    return this.http.patch<SingleOfferResponse>(
      `${this.apiUrl}/professional/${id}/cancel`,
      {},
      { withCredentials: true }
    );
  }

  getCandidates(requestId: number): Observable<{ success: boolean; message: string; data: OfferResponse[] }> {
    return this.http.get<{ success: boolean; message: string; data: OfferResponse[] }>(
      `${this.apiUrl}/applicant/request/${requestId}/candidates`,
      { withCredentials: true }
    );
  }

  hireOffer(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.apiUrl}/applicant/offers/${id}/hire`,
      {},
      { withCredentials: true }
    );
  }
}
