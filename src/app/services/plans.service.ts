import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface PlanFeature {
  id: number;
  featureName: string;
  featureKey: string;
  description: string;
  limitValue: number | null;
  isUnlimited: boolean;
}

export interface PlanInterval {
  id: number;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  intervalDisplay: string;
  pricePerPeriod: number;
  currency: string;
  daysPerPeriod: number;
  features: PlanFeature[];
}

export interface Plan {
  id: number;
  code: string;
  name: string;
  description: string;
  status: string;
  intervals: PlanInterval[];
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse {
  success: boolean;
  message: string;
  data: Plan[];
}

@Injectable({
  providedIn: 'root'
})
export class PlansService {
  private apiUrl = `${environment.apiUrl}/plans`;
  private plansCache = new BehaviorSubject<Plan[]>([]);
  public plans$ = this.plansCache.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * 📍 PASO 9: Listar Planes Disponibles
   * Carga todos los planes activos con sus intervalos y features
   */
  loadActivePlans(): void {
    this.getAllPlans().subscribe({
      next: (response) => {
        this.plansCache.next(response.data);
      },
      error: (err) => console.error('❌ Error loading plans:', err)
    });
  }

  /**
   * 📍 PASO 9: Obtener todos los planes (mensual/anual)
   * GET /plans
   */
  getAllPlans(): Observable<PlansResponse> {
    return this.http.get<PlansResponse>(`${this.apiUrl}`, {
      withCredentials: true
    }).pipe(
      tap(response => console.log('✅ Plans loaded:', response.data))
    );
  }

  /**
   * Obtener plan por ID desde el caché
   */
  getPlanById(id: number): Observable<Plan | undefined> {
    return this.plans$.pipe(
      map(plans => plans.find(plan => plan.id === id))
    );
  }

  /**
   * Obtener planes filtrados por intervalo
   * @param interval 'monthly' o 'yearly'
   */
  getPlansByInterval(interval: 'monthly' | 'yearly'): Observable<Plan[]> {
    return this.plans$.pipe(
      map(plans => plans.map(plan => ({
        ...plan,
        intervals: plan.intervals.filter(int => int.interval === interval)
      })).filter(plan => plan.intervals.length > 0))
    );
  }

  /**
   * Obtener un plan interval específico por su ID
   * @param planIntervalId ID del intervalo del plan
   */
  getPlanIntervalById(planIntervalId: number): Observable<PlanInterval | undefined> {
    return this.plans$.pipe(
      map(plans => {
        for (const plan of plans) {
          const interval = plan.intervals.find(int => int.id === planIntervalId);
          if (interval) return interval;
        }
        return undefined;
      })
    );
  }

  /**
   * 🔍 Buscar plan por características
   * Ejemplo: Buscar plan con ofertas ilimitadas
   */
  findPlanByFeature(featureKey: string, isUnlimited: boolean): Observable<Plan[]> {
    return this.plans$.pipe(
      map(plans => plans.filter(plan =>
        plan.intervals.some(interval =>
          interval.features.some(feature =>
            feature.featureKey === featureKey && feature.isUnlimited === isUnlimited
          )
        )
      ))
    );
  }

  /**
   * ❌ DEPRECADO: El backend ya no usa el concepto de "days"
   * Usa getPlansByInterval('monthly' | 'yearly') en su lugar
   */
  getPlansByDays(days: number): Observable<Plan[]> {
    console.warn('⚠️ getPlansByDays() está deprecado. Usa getPlansByInterval()');
    // Convertir days a interval para compatibilidad
    const interval = days === 30 ? 'monthly' : days === 365 ? 'yearly' : null;
    if (!interval) return new Observable(observer => observer.next([]));
    return this.getPlansByInterval(interval);
  }

  /**
   * ❌ DEPRECADO: Ya no existe endpoint /plans/active
   * Usa getAllPlans() en su lugar (ya filtra activos)
   */
  getActivePlans(): Observable<Plan[]> {
    console.warn('⚠️ getActivePlans() está deprecado. Usa getAllPlans()');
    return this.getAllPlans().pipe(
      map(response => response.data)
    );
  }
}
