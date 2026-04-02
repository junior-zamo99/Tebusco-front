
export enum RequestStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum RequestUrgencyEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY',
}

export enum OfferStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  VOIDED = 'VOIDED'
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

// ==========================================
// SUB-INTERFACES (Objetos anidados)
// ==========================================

export interface CityResponse {
  id: number;
  name: string;
  countryId: number;
  countryName: string;
}

export interface UserBasicInfo {
  id: number;          // ID de la entidad (Applicant/Professional)
  userId: number;      // ID del usuario (Auth)
  userName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string | null;
  userPhotoUrl: string | null;
}

export interface RequestCategoryResponse {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: number | null;
  level: number;
}


export interface RequestResponse {
  id: number;
  title: string;
  description: string;

  // Ubicación
  cityId: number | null;
  city: CityResponse | null;
  address: string | null;
  lat: number | null;
  lng: number | null;

  // Detalles
  urgency: RequestUrgencyEnum;
  budget: number | null;
  dateNeeded: Date | string | null;
  hourPreferred: string | null;
  status: RequestStatusEnum;


  applicantId: number;
  applicant: UserBasicInfo;

  professionalId?: number | null;
  professional?: UserBasicInfo | null;


  categories: RequestCategoryResponse[];


  hasApplied?: boolean;
  totalOffers?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}


export interface RequestCategoryInput {
  categoryId: number;
  level?: number;
  parentId?: number | null;
}

export interface CreateRequestDTO {
  title: string;
  description: string;
  categories: RequestCategoryInput[];
  cityId: number;
  address: string;
  urgency?: RequestUrgencyEnum;
  budget?: number | null;
  dateNeeded?: Date | string | null;
  hourPreferred?: string | null;
  lat?: number;
  lng?: number;
}

export interface UpdateRequestDTO extends Partial<CreateRequestDTO> {
  status?: RequestStatusEnum;
}

export interface AssignProfessionalDTO {
  professionalId: number;
}



export interface RequestFilterDTO {
  status?: RequestStatusEnum;
  categoryId?: number;
  applicantId?: number;
  professionalId?: number;
  urgency?: RequestUrgencyEnum;
  minBudget?: number;
  maxBudget?: number;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  page?: number;
  limit?: number;
}

export interface RequestStats {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  cancelledRequests: number;

  requestsByCategory: {
    categoryId: number;
    categoryName: string;
    count: number;
  }[];

  requestsByUrgency: {
    urgency: string;
    count: number;
  }[];
}

