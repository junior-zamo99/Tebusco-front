export enum RequestStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ServiceRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  photos?: string[];
  location: RequestLocation;
  preferredDate?: Date;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  status: RequestStatus;
  offers: Offer[];
  selectedOfferId?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface RequestLocation {
  address: string;
  latitude?: number;
  longitude?: number;
  city: string;
  region?: string;
  country: string;
  additionalInfo?: string;
}

export interface Offer {
  id: string;
  requestId: string;
  professionalId: string;
  professionalName: string;
  professionalAvatar?: string;
  professionalRating: number;
  profileId: string;
  message: string;
  proposedDate?: Date;
  estimatedDuration?: string;
  price?: {
    amount: number;
    currency: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: Date;
  updatedAt: Date;
}
