import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Professional } from '../models/professional.model';
import { Plan } from '../models/plan.model';
import { CategoryNode } from '../models/category.model';

export interface UpgradeState {
  professional: Professional | null;
  selectedPlan: Plan | null;
  selectedCategories: CategoryNode[];
  completedSteps: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionalUpgradeStateService {
  private readonly STORAGE_KEY = 'professional_upgrade_state';

  private upgradeState$ = new BehaviorSubject<UpgradeState>({
    professional: null,
    selectedPlan: null,
    selectedCategories: [],
    completedSteps: []
  });

  constructor() {
    this.loadStateFromStorage();
  }

  /**
   * Obtener el estado actual como Observable
   */
  getState(): Observable<UpgradeState> {
    return this.upgradeState$.asObservable();
  }

  /**
   * Obtener el estado actual (snapshot)
   */
  getCurrentState(): UpgradeState {
    return this.upgradeState$.value;
  }

  /**
   * Actualizar información del profesional
   */
  setProfessional(professional: Professional): void {
    this.updateState({ professional });
    this.markStepCompleted(1);
  }

  /**
   * Marcar paso de documentos como completado
   */
  setDocumentsCompleted(): void {
    this.markStepCompleted(2);
  }

  /**
   * Actualizar plan seleccionado
   */
  setSelectedPlan(plan: Plan): void {
    this.updateState({ selectedPlan: plan });
    this.markStepCompleted(3);
  }

  /**
   * Marcar confirmación de suscripción
   */
  setSubscriptionConfirmed(): void {
    this.markStepCompleted(4);
  }

  /**
   * Actualizar categorías seleccionadas
   */
  setSelectedCategories(categories: CategoryNode[]): void {
    this.updateState({ selectedCategories: categories });
    this.markStepCompleted(5);
  }

  /**
   * Marcar configuración de categorías como completada
   */
  setCategoriesConfigured(): void {
    this.markStepCompleted(6);
  }

  /**
   * Verificar si un paso está completado
   */
  isStepCompleted(step: number): boolean {
    return this.upgradeState$.value.completedSteps.includes(step);
  }

  /**
   * Verificar si se puede acceder a un paso
   */
  canAccessStep(step: number): boolean {
    if (step === 1) return true;
    return this.isStepCompleted(step - 1);
  }

  /**
   * Obtener el siguiente paso disponible
   */
  getNextStep(): number {
    const completed = this.upgradeState$.value.completedSteps;
    if (completed.length === 0) return 1;
    const maxCompleted = Math.max(...completed);
    return Math.min(maxCompleted + 1, 7);
  }

  /**
   * Resetear el estado
   */
  resetState(): void {
    const emptyState: UpgradeState = {
      professional: null,
      selectedPlan: null,
      selectedCategories: [],
      completedSteps: []
    };
    this.upgradeState$.next(emptyState);
    this.clearStorage();
  }

  /**
   * Marcar upgrade como completado
   */
  completeUpgrade(): void {
    this.markStepCompleted(7);
  }



  private updateState(partial: Partial<UpgradeState>): void {
    const current = this.upgradeState$.value;
    const updated = { ...current, ...partial };
    this.upgradeState$.next(updated);
    this.saveStateToStorage(updated);
  }

  private markStepCompleted(step: number): void {
    const current = this.upgradeState$.value;
    if (!current.completedSteps.includes(step)) {
      const updated = {
        ...current,
        completedSteps: [...current.completedSteps, step].sort((a, b) => a - b)
      };
      this.upgradeState$.next(updated);
      this.saveStateToStorage(updated);
    }
  }

  private saveStateToStorage(state: UpgradeState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving upgrade state to storage:', error);
    }
  }

  private loadStateFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const state: UpgradeState = JSON.parse(stored);
        this.upgradeState$.next(state);
      }
    } catch (error) {
      console.error('Error loading upgrade state from storage:', error);
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing upgrade state from storage:', error);
    }
  }
}
