export enum Sex {
    Male = "male",
    Female = "female",
    Other = "other"
}

export interface Country {
    id: number;
    name: string;
    code: string;
}

export interface City {
    id: number;
    name: string;
    code: string;
    country?: Country;
}

export interface User {
    id: number;
    name: string;
    lastName: string;
    email: string;
    phone: string | null;
    photoUrl: string | null;
    status: string;
    sex: Sex | null;
}

export interface Applicant {
    id: number;
    ci: string;
    isFrequentCustomer: boolean;
    city?: City | null;
}

export interface Professional {
    id: number;
    isVerified: boolean;
    status: string;
    city?: City | null;
}

export interface Company {
    id: number;
    name: string;
    nit: string;
    isVerified: boolean;
    status: string;
}

export interface UserAddress {
    addressId: number;
    label: string;
    country: string;
    state: string | null;
    city: string;
    address: string | null;
    postalCode: string | null;
    lat: number | null;
    lng: number | null;
    isDefault: boolean;
    isActive: boolean;
    fullAddress?: string;
}

export interface RegisterRequest {
    name: string;
    lastName: string;
    email: string;
    password: string;
    ci: string;
    phone?: string;
    sex?: Sex;
    cityid?: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
    applicant: Applicant;
    professional?: Professional | null;
    company?: Company | null;
    userAddress?: UserAddress | null;
}
