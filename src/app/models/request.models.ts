export enum RequestStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum RequestUrgencyEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY',
}

export interface PaginationParams {
  page?: number;
  limit?: number;
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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface CategoryRequestInput {
  categoryId: number;
  parentId?: number;
  level: number;
}

export interface CreateRequestDTO {
  title: string;
  description: string;
  categories: CategoryRequestInput[];
  urgency: RequestUrgencyEnum;
  lat?: number;
  lng?: number;
  address?: string;
  budget?: number;
  dateNeeded?: Date | string;
  hourPreferred?: string;
}

export interface UpdateRequestDTO extends Partial<CreateRequestDTO> {
  status?: RequestStatusEnum;
}

export interface RequestFilterDTO {
  status?: RequestStatusEnum;
  categoryId?: number;
  applicantId?: number;
  professionalId?: number;
  urgency?: RequestUrgencyEnum;
  minBudget?: number;
  maxBudget?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface RequestResponse {
  id: number;
  title: string;
  description: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  urgency: RequestUrgencyEnum;
  budget: number | null;
  dateNeeded: Date | null;
  hourPreferred: string | null;
  status: RequestStatusEnum;
  applicantId: number;
  professionalId: number | null;
  hasApplied?: boolean;
  applicant: {
    id: number;
    userId: number;
    userName: string;
    userLastName: string;
    userEmail: string;
    userPhone: string;
    userPhotoUrl: string | null;
  };
  professional?: {
    id: number;
    userId: number;
    userName: string;
    userLastName: string;
    userEmail: string;
    userPhone: string;
    userPhotoUrl: string | null;
  };
  categories: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string | null;
    categoryId: number;
    parentId: number | null;
    level: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  requestsByCategory: { categoryId: number; categoryName: string; count: number }[];
  requestsByUrgency: { urgency: string; count: number }[];
}
