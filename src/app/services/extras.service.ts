import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExtraFeature {
  id: number;
  name: string;
  displayName: string;
}

export interface ExtraPackage {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  quantity: number;
  feature: ExtraFeature;
}

export interface ExtrasResponse {
  success: boolean;
  data: ExtraPackage[];
  message: string;
}

export interface PurchaseRequest {
  packageId: number;
  paymentMethodId: number;
  quantity?: number;
  externalReference?: string;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: {
    purchasedExtra: any;
    transaction: any;
    updatedLimit: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ExtrasService {
  private apiUrl = `${environment.apiUrl}/extras`;

  constructor(private http: HttpClient) {}

  getPackages(): Observable<ExtrasResponse> {
    return this.http.get<ExtrasResponse>(`${this.apiUrl}/packages`, {
      withCredentials: true
    });
  }

  purchasePackage(data: PurchaseRequest): Observable<PurchaseResponse> {
    return this.http.post<PurchaseResponse>(`${this.apiUrl}/purchase`, data, {
      withCredentials: true
    });
  }
}
