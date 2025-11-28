import { ProfessionalProfile } from "./professional-profile.model";


export enum UserRole {
  SOLICITANTE = 'SOLICITANTE',
  PROFESIONAL = 'PROFESIONAL',
  EMPRESA = 'EMPRESA'
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Solicitante extends User {
  role: UserRole.SOLICITANTE;
  favoriteCategories?: string[];
  savedProfessionals?: string[];
}

export interface Profesional extends User {
  role: UserRole.PROFESIONAL;
  profiles: ProfessionalProfile[];
  rating: number;
  totalReviews: number;
  verified: boolean;
}

