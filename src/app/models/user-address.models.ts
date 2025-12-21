
export enum UserAddressTypeEnum {
    HIBRID = 'H',
    APPLICANT = 'A',
    PROFESSIONAL = 'P'
}
export interface UserAddress {
  id: number;
  label: string;
  country: string;
  state?: string;
  city: string;
  address?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
  isActive: boolean;
  fullAddress?: string;
  type?: UserAddressTypeEnum;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para Envío de Datos
export interface CreateUserAddressDTO {
  label: string;
  country: string;
  state?: string;
  city: string;
  address?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
  fullAddress?: string;
  type?: UserAddressTypeEnum;
}

export interface UpdateUserAddressDTO {
  label?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
  isActive?: boolean;
  fullAddress?: string;
  type?: UserAddressTypeEnum;
}

export interface CreateLocationDTO {
  lat: number;
  lng: number;
  label: string;
  city: string;
  country?: string;
  state?: string;
  fullAddress?: string;
  type?: UserAddressTypeEnum;
}

// Filtros para GET
export interface GetAddressFilterDTO {
  type?: UserAddressTypeEnum;
  isActive?: boolean;
  isDefault?: boolean;
}
