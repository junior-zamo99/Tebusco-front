export interface ProfessionalProfile {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  experience: string;
  skills: string[];
  certifications?: Certification[];
  portfolio?: PortfolioItem[];
  contactInfo: ContactInfo;
  location: Location;
  pricing?: PricingInfo;
  availability: Availability;
  discount?: Discount;
  rating: number;
  totalReviews: number;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateIssued: Date;
  expiryDate?: Date;
  credentialUrl?: string;
  documentUrl?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  completedDate: Date;
}

export interface ContactInfo {
  phone?: string;
  whatsapp?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  website?: string;
  address?: string;
}

export interface Location {
  type: 'POINT' | 'CITY' | 'REGION';
  latitude?: number;
  longitude?: number;
  city: string;
  region?: string;
  country: string;
  radius?: number;
}

export interface PricingInfo {
  hourlyRate?: number;
  fixedPrice?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  currency: string;
}

export interface Availability {
  days: DayAvailability[];
  emergencyService: boolean;
  responseTime?: string;
}

export interface DayAvailability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  available: boolean;
  hours?: {
    start: string;
    end: string;
  };
}

export interface Discount {
  percentage: number;
  validUntil: Date;
  description?: string;
}
