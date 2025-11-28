import { Subscription } from './subscription.model'; // Adjust the import path based on your project structure

export interface ProfileCategory {
  id: number;
  name: string;
}

export interface Professional {
  id: number;
  userId: number;
  userName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string;
  userPhotoUrl: string | null;
  title: string | null;
  isVisible: boolean;
  visible: boolean;
  status: ProfessionalStatus;
  isCompanyProfessional: boolean;
  companyId: number | null;
  offersCount: number;
  categoriesCount: number;
  documentsDeadline: Date | null;
  isVerified: boolean;
  activeSubscriptionId: number | null;
  profileCategories: ProfileCategory[];
  documents: Document[];
  activeSubscription: Subscription | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfessionalStatus =
  | 'pending'
  | 'documents_uploaded'
  | 'payment_completed'
  | 'documents_approved'
  | 'documents_rejected'
  | 'active';

export interface ProfessionalUpgradeRequest {
  name: string;
  lastName: string;
  phone: string;
  birthDate: string;
  title: string;
}

export interface ProfessionalStatusInfo {
  isProfessional: boolean;
  status: ProfessionalStatus | null;
  currentStep: string | null;
  canProceed: boolean;
  message: string;
  documentsUploaded?: number;
  documentsRequired?: number;
  documentsApproved?: number;
  categoriesConfigured?: number;
  hasActiveSubscription?: boolean;
}
