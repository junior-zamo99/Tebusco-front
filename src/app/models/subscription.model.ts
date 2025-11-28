import { PlanFeature } from './plan.model';

export interface Subscription {
  id: number;
  planId: number;
  planCode: string;
  planName: string;
  price: number;
  days: number;
  start: Date;
  end: Date;
  status: SubscriptionStatus;
  features: PlanFeature[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface SubscriptionRequest {
  planId: number;
  professionalId: number;
}

export interface CancelSubscriptionRequest {
  reason?: string;
}
