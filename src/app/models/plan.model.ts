export interface PlanFeature {
  id: number;
  featureName: string;
  limit: number | null;
  status: string;
  createdAt: string;
}

export interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  price: number;
  days: number;
  status: string;
  features: PlanFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse {
  success: boolean;
  message: string;
  data: Plan[];
}
