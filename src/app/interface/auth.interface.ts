export interface UserAddress {
  addressId?: number;
  label: string;
  country: string;
  state: string | null;
  city: string;
  address: string | null;
  postalCode: string | null;
  lat: number | null;
  lng: number | null;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  status: string;
  lastLogin?: Date;
}

export interface Applicant {
  id: number;
  ci: string;
  isFrequentCustomer: boolean;
}

export interface Professional {
  id: number;
  isVerified: boolean;
  statusL: string;
}

export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
  ci: string;
  phone?: string;
  userAddress?: {
    label?: string;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    postalCode?: string;
    lat?: number;
    lng?: number;

  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    applicant: Applicant;
    professional?: Professional;
    userAddress?: UserAddress;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
    applicant: Applicant;
    professional: Professional;
    userAddresses: UserAddress[];
  };
}
