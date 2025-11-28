import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// 🆕 Interfaces según el backend
export interface PaymentMethod {
  id: number;
  name: string;
  type: 'card' | 'qr' | 'mobile_payment';
  isActive: boolean;
}

export interface SubscriptionUsage {
  id?: number;
  featureKey: 'offers' | 'categories';
  featureName: string;
  usedCount: number;
  currentLimit: number | null;
  isUnlimited: boolean;
  percentage?: number;
}

export interface Subscription {
  id: number;
  userId: number;
  planIntervalId: number;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  nextResetAt: string;
  autoRenew: boolean;
  plan: {
    id: number;
    name: string;
    interval: 'monthly' | 'yearly';
    price: number;
  };
  usages: SubscriptionUsage[];
}

export interface Transaction {
  id: number;
  subscriptionId: number;
  type: 'subscription' | 'extra';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  createdAt: string;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    subscription: Subscription;
    transaction: Transaction;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient) {}


  getPaymentMethods(): Observable<{ success: boolean; message: string; data: PaymentMethod[] }> {
    return this.http.get<{ success: boolean; message: string; data: PaymentMethod[] }>(
      `${this.apiUrl}/payment-methods`,
      { withCredentials: true }
    );
  }


  createSubscription(
    planIntervalId: number,
    paymentMethodId: number,
    autoRenew: boolean = true
  ): Observable<CreateSubscriptionResponse> {
    return this.http.post<CreateSubscriptionResponse>(
      `${this.apiUrl}`,
      { planIntervalId, paymentMethodId, autoRenew },
      { withCredentials: true }
    );
  }


  getMySubscription(): Observable<{ success: boolean; message: string; data: Subscription }> {
    return this.http.get<{ success: boolean; message: string; data: Subscription }>(
      `${this.apiUrl}/me`,
      { withCredentials: true }
    );
  }


  getMySubscriptionUsage(): Observable<{ success: boolean; data: SubscriptionUsage[] }> {
    return this.http.get<{ success: boolean; data: SubscriptionUsage[] }>(
      `${this.apiUrl}/me/usage`,
      { withCredentials: true }
    );
  }


  getMyTransactions(): Observable<{ success: boolean; data: Transaction[] }> {
    return this.http.get<{ success: boolean; data: Transaction[] }>(
      `${this.apiUrl}/me/transactions`,
      { withCredentials: true }
    );
  }


  getSubscriptionById(subscriptionId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${subscriptionId}`, {
      withCredentials: true
    });
  }


  cancelSubscription(subscriptionId: number, reason?: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${subscriptionId}/cancel`,
      { reason },
      { withCredentials: true }
    );
  }


  getExtraPackages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/extras`, {
      withCredentials: true
    });
  }


  purchaseExtraPackage(
    extraPackageId: number,
    quantity: number,
    paymentMethodId: number
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/extras`,
      { extraPackageId, quantity, paymentMethodId },
      { withCredentials: true }
    );
  }


  getActiveSubscription(professionalId: number): Observable<any> {
    console.warn('⚠️ getActiveSubscription() está deprecado. Usa getMySubscription()');
    return this.getMySubscription();
  }


  getProfessionalPlans(): Observable<any> {
    console.warn('⚠️ getProfessionalPlans() está deprecado. Usa PlansService.getAllPlans()');
    return this.http.get(`${environment.apiUrl}/plans`, {
      withCredentials: true
    });
  }


  getPlanById(planId: number): Observable<any> {
    console.warn('⚠️ getPlanById() está deprecado. Usa PlansService');
    return this.http.get(`${environment.apiUrl}/plans/${planId}`, {
      withCredentials: true
    });
  }
}
