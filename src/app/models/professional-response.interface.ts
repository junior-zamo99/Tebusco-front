
export interface RegistrationStatus {
  isProfessional: boolean;
  status: string;
  currentStep: 'documents' | 'payment' | 'categories' | 'complete' | 'unknown';
  canProceed: boolean;
  message: string;
}

export interface UsageDetail {
  limit: number | string;
  used: number;
  available: number | string;
}

export interface ProfessionalResponse {
  success: boolean;
  data: {
    registrationStatus: RegistrationStatus;
    usage: {
      categories: UsageDetail;
      offers: UsageDetail;
    };

  };
}
