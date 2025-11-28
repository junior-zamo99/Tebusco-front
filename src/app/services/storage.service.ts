import { Injectable } from '@angular/core';

export interface StorageUser {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl: string | null;
  status: string;
}

export interface StorageApplicant {
  id: number;
  ci: string;
  isFrequentCustomer: boolean;
}

export interface StorageUserAddress {
  addressId: number;
  label: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postalCode: string | null;
  lat: string;
  lng: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface typeOfUser {
  keyType: number;
}

export interface StorageProfessional {
  id?: number;
  specialization?: string;
  licenseNumber?: string;
  yearsOfExperience?: number;
  [key: string]: any;
}

export interface StorageCompany {
  id?: number;
  name?: string;
  businessName?: string;
  nit?: string;
  [key: string]: any;
}

export interface StorageData {
  user: StorageUser;
  applicant?: StorageApplicant;
  userAddress?: StorageUserAddress;
  professional?: StorageProfessional;
  company?: StorageCompany;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly USER_KEY = 'app_user';
  private readonly APPLICANT_KEY = 'app_applicant';
  private readonly USER_ADDRESS_KEY = 'app_user_address';
  private readonly PROFESSIONAL_KEY = 'app_professional';
  private readonly COMPANY_KEY = 'app_company';

  saveUser(user: StorageUser): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  }

  saveApplicant(applicant: StorageApplicant): void {
    try {
      localStorage.setItem(this.APPLICANT_KEY, JSON.stringify(applicant));
    } catch (error) {
      console.error('Error al guardar applicant:', error);
    }
  }

  saveUserAddress(userAddress: StorageUserAddress): void {
    try {
      localStorage.setItem(this.USER_ADDRESS_KEY, JSON.stringify(userAddress));
    } catch (error) {
      console.error('Error al guardar dirección:', error);
    }
  }

  saveProfessional(professional: StorageProfessional): void {
    try {
      localStorage.setItem(this.PROFESSIONAL_KEY, JSON.stringify(professional));
    } catch (error) {
      console.error('Error al guardar profesional:', error);
    }
  }

  saveTypeOfUser(typeOfUser: typeOfUser): void {
    try {
        localStorage.setItem('type_of_user', JSON.stringify(typeOfUser));
    } catch (error) {
        console.error('Error al guardar tipo de usuario:', error);
    }
  }

  saveCompany(company: StorageCompany): void {
    try {
      localStorage.setItem(this.COMPANY_KEY, JSON.stringify(company));
    } catch (error) {
      console.error('Error al guardar empresa:', error);
    }
  }

  saveAllData(data: StorageData): void {
    try {
      this.saveUser(data.user);
      if (data.applicant) this.saveApplicant(data.applicant);
      if (data.userAddress) this.saveUserAddress(data.userAddress);
      if (data.professional) this.saveProfessional(data.professional);
      if (data.company) this.saveCompany(data.company);
    } catch (error) {
      console.error('Error al guardar todos los datos:', error);
    }
  }

  getUser(): StorageUser | null {
    try {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  getApplicant(): StorageApplicant | null {
    try {
      const applicant = localStorage.getItem(this.APPLICANT_KEY);
      return applicant ? JSON.parse(applicant) : null;
    } catch (error) {
      console.error('Error al obtener applicant:', error);
      return null;
    }
  }

  getUserAddress(): StorageUserAddress | null {
    try {
      const address = localStorage.getItem(this.USER_ADDRESS_KEY);
      return address ? JSON.parse(address) : null;
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      return null;
    }
  }

  getProfessional(): StorageProfessional | null {
    try {
      const professional = localStorage.getItem(this.PROFESSIONAL_KEY);
      return professional ? JSON.parse(professional) : null;
    } catch (error) {
      console.error('Error al obtener profesional:', error);
      return null;
    }
  }

  getCompany(): StorageCompany | null {
    try {
      const company = localStorage.getItem(this.COMPANY_KEY);
      return company ? JSON.parse(company) : null;
    } catch (error) {
      console.error('Error al obtener empresa:', error);
      return null;
    }
  }

  getTypeOfUser(): typeOfUser | null {
    try {
        const typeUser = localStorage.getItem('type_of_user');
        return typeUser ? JSON.parse(typeUser) : null;
    } catch (error) {
        console.error('Error al obtener tipo de usuario:', error);
        return null;
    }
  }

  getAllData(): StorageData {
    return {
      user: this.getUser() || ({} as StorageUser),
      applicant: this.getApplicant() || undefined,
      userAddress: this.getUserAddress() || undefined,
      professional: this.getProfessional() || undefined,
      company: this.getCompany() || undefined
    };
  }

  isUserLoggedIn(): boolean {
    return this.getUser() !== null;
  }

  clearAll(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.APPLICANT_KEY);
      localStorage.removeItem(this.USER_ADDRESS_KEY);
      localStorage.removeItem(this.PROFESSIONAL_KEY);
      localStorage.removeItem(this.COMPANY_KEY);
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
    }
  }

  clearUser(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error al limpiar usuario:', error);
    }
  }
}
