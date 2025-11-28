export interface ProfessionalCompleteResponse {
  success: boolean;
  message: string;
  data: ProfessionalCompleteData;
}

export interface ProfessionalCompleteData {
  professional: ProfessionalInfo;
  user: UserInfo;
  subscription: SubscriptionInfo | null;
  usage: UsageInfo;
  profileCategories: ProfileCategoryDetail[];
  documents: DocumentsSummary;
}

export interface ProfessionalInfo {
  id: number;
  status: string;
  isVisible: boolean;
  visible: boolean;
  isVerified: boolean;
  isCompanyProfessional: boolean;
  companyId: number | null;
  documentsDeadline: string;

  // ⭐ NUEVOS CAMPOS
  avatarUrl: string | null;
  whatsappNumber: string | null;
  websiteUrl: string | null;
  facebookProfile: string | null;
  instagramProfile: string | null;
  linkedinProfile: string | null;
  youtubeChannel: string | null;
  businessEmail: string | null;
  bio: string | null;
  totalExperience: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl: string | null;
  birthDate: string;
}

export interface SubscriptionInfo {
  id: number;
  planName: string;
  planCode: string;
  interval: string;
  status: string;
  startDate: string;
  endDate: string;
  nextResetAt: string;
  currentPeriodNumber: number;
  periodsPurchased: number;
  autoRenew: boolean;
}

export interface UsageInfo {
  categories: UsageDetail;
  offers: UsageDetail;
}

export interface UsageDetail {
  limit: number | string;
  used: number;
  available: number | string;
}

export interface ProfileCategoryDetail {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryImageUrl: string;
  description: string;
  experience: number;
  priceMin: number;
  isActive: boolean;
  isVerified: boolean;
  status: string;
  specialties: specialtiesDetail[];
  visible: boolean;
  specialtiesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface specialtiesDetail{
  id: number;
  name: string;
}

export interface DocumentsSummary {
  total: number;
  required: number;
  uploaded: number;
  approved: number;
  rejected: number;
  list: DocumentDetail[];
}

export interface DocumentDetail {
  id: number;
  documentType: string;
  fileId: number;
  fileName: string;
  fileUrl: string;
  status: string;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface UpdateProfessionalProfileDTO {
  name?: string;
  lastName?: string;
  phone?: string;
  birthDate?: Date;
  photoUrl?: string;
  avatarUrl?: string;
  whatsappNumber?: string;
  websiteUrl?: string;
  facebookProfile?: string;
  instagramProfile?: string;
  linkedinProfile?: string;
  youtubeChannel?: string;
  businessEmail?: string;
  bio?: string;
  totalExperience?: number;
  visible?: boolean;
}
