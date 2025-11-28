export interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  isTop: boolean;
  order: number;
  children: CategoryNode[];
  level: number;
  childrenCount: number;
  parentId: number | null;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: CategoryNode[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isTop: boolean;
  order: number;
  level: number;
  parentId: number | null;
  parent?: Category;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileCategory {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  categoryImageUrl: string | null;
  description: string | null;
  experience: number | null;
  priceMin: number | null;
  status: ProfileCategoryStatus;
  isActive: boolean;
  isVerified: boolean;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfileCategoryStatus = 'pending' | 'approved' | 'rejected';

export interface CreateProfileCategoryRequest {
  categoryId: number;
}

export interface UpdateProfileCategoryRequest {
  description?: string;
  experience?: number;
  priceMin?: number;
  isActive?: boolean;
  visible?: boolean;
}
