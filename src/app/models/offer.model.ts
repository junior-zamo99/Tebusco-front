export enum OfferStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  VOIDED = 'VOIDED'
}

export type OfferHistoryType = 'active' | 'history' | 'all';

export interface OfferCategoryInfo {
  id: number;
  name: string;
  level: number;
}

export interface OfferProfessionalInfo {
  id: number;
  name: string | null;
  lastName: string;
  photoUrl: string | null;
  email: string | null;
  phone: string | null;
  categories: OfferCategoryInfo[];
}

export interface OfferRequestInfo {
  id: number;
  title: string;
  status: string;
  urgency: string;
  description: string;
  categories: OfferCategoryInfo[];
}

export interface OfferResponse {
  id: number;
  amount: number;
  currency: string;
  description: string | null;
  estimatedDuration: string | null;
  status: OfferStatusEnum;
  isActive: boolean;
  hasApplied?: boolean;
  createdAt: string | Date;
  professional: OfferProfessionalInfo;
  request: OfferRequestInfo;
}

export interface CreateOfferDTO {
  requestId: number;
  amount: number;
  currency?: string;
  description?: string;
  estimatedDuration?: string;
}

export interface UpdateOfferDTO {
  amount?: number;
  currency?: string;
  description?: string;
  estimatedDuration?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}
