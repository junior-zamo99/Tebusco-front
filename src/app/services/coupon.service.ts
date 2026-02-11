import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ========================================
// 📋 INTERFACES - Basadas en el backend
// ========================================

export interface CouponValidationItem {
  type: 'plan' | 'extra' | 'ad';
  id: number;
  amount: number;
  quantity?: number;
}

export interface CouponItemDetail {
  type: 'plan' | 'extra' | 'ad';
  id: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  reason?: string;
}

export interface ValidateCouponDTO {
  code: string;
  items: CouponValidationItem[];
  totalAmount: number;
}

export interface CouponResponseDTO {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxDiscountPercent: number | null;
  maxDiscountAmount: number | null;
  appliesTo: string;
  specificPlanIds: number[] | null;
  specificExtraIds: number[] | null;
  specificAdPlanIds: number[] | null;
  validFrom: Date | null;
  validUntil: Date | null;
  maxTotalUses: number | null;
  maxUsesPerUser: number | null;
  minPurchaseAmount: number | null;
  currency: string;
  restrictedToUserIds: number[] | null;
  isStackable: boolean;
  isActive: boolean;
  isReferralCoupon: boolean;
  referralType: string | null;
  timesUsed: number;
  totalDiscountGiven: number;
  usesRemaining: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: CouponResponseDTO;
  
  // Nuevos campos del backend
  totalAmount?: number;
  totalDiscountAmount?: number;
  totalFinalAmount?: number;
  itemsDetail?: CouponItemDetail[];
  
  // Campos legacy (mantener para compatibilidad)
  discountAmount?: number;
  finalAmount?: number;
  
  reason?: string;
  error?: string;
}

export interface ValidateCouponResponse {
  success: boolean;
  data: CouponValidationResult;
  message: string;
}

export interface CouponPublicInfoResponse {
  success: boolean;
  data: {
    code: string;
    name: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    validUntil: Date | null;
    minPurchaseAmount: number | null;
  };
  message: string;
}

// ========================================
// 🎯 SERVICIO DE CUPONES
// ========================================

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = `${environment.apiUrl}/coupons`;

  constructor(private http: HttpClient) {}

  /**
   * 🎫 Validar cupón de descuento
   * POST /coupons/validate
   * 
   * @param code - Código del cupón
   * @param items - Array de items del carrito
   * @param totalAmount - Monto total antes de descuento
   * @returns Observable con resultado de validación
   */
  validateCoupon(
    code: string,
    items: CouponValidationItem[],
    totalAmount: number
  ): Observable<ValidateCouponResponse> {
    const body: ValidateCouponDTO = {
      code: code.trim().toUpperCase(),
      items: items,
      totalAmount: totalAmount
    };

    console.log('🎫 Validando cupón:', body);

    return this.http.post<ValidateCouponResponse>(
      `${this.apiUrl}/validate`,
      body,
      { withCredentials: true }
    );
  }

  /**
   * 📋 Obtener información pública de un cupón
   * GET /coupons/public/:code
   * 
   * Nota: Este endpoint puede no requerir autenticación
   * y solo muestra información básica del cupón
   * 
   * @param code - Código del cupón
   * @returns Observable con información pública del cupón
   */
  getCouponPublicInfo(code: string): Observable<CouponPublicInfoResponse> {
    return this.http.get<CouponPublicInfoResponse>(
      `${this.apiUrl}/public/${code.trim().toUpperCase()}`,
      { withCredentials: true }
    );
  }

  /**
   * 💰 Calcular porcentaje de descuento
   * Utilidad para mostrar en UI
   * 
   * @param originalAmount - Precio original
   * @param discountAmount - Monto de descuento
   * @returns Porcentaje redondeado
   */
  calculateDiscountPercentage(originalAmount: number, discountAmount: number): number {
    if (originalAmount === 0) return 0;
    return Math.round((discountAmount / originalAmount) * 100);
  }

  /**
   * 🎨 Formatear descripción del descuento
   * Utilidad para mostrar en UI
   * 
   * @param coupon - Datos del cupón
   * @returns String formateado como "20% OFF" o "-$50"
   */
  formatDiscountDisplay(coupon: CouponResponseDTO): string {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else {
      return `-${coupon.discountValue} ${coupon.currency}`;
    }
  }
}
