import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ProfessionalUpgradeStateService } from '../services/professional-upgrade-state.service';


export const upgradeStepGuard: CanActivateFn = (route, state) => {
  const stateService = inject(ProfessionalUpgradeStateService);
  const router = inject(Router);

  // Mapeo de rutas a números de paso
  const stepMap: { [key: string]: number } = {
    'info': 1,
    'documents': 2,
    'plan': 3,
    'confirm': 4,
    'categories': 5,
    'configure': 6,
    'complete': 7
  };

  // Obtener el paso actual desde la URL
  const urlSegments = state.url.split('/');
  const stepName = urlSegments[urlSegments.length - 1];
  const currentStep = stepMap[stepName];

  if (!currentStep) {
    router.navigate(['/professional/info']);
    return false;
  }

  // Paso 1 siempre es accesible
  if (currentStep === 1) {
    return true;
  }

  // Verificar si puede acceder a este paso
  if (!stateService.canAccessStep(currentStep)) {
    // Redirigir al siguiente paso disponible
    const nextStep = stateService.getNextStep();
    const nextRoute = Object.keys(stepMap).find(key => stepMap[key] === nextStep);
    router.navigate([`/professional/${nextRoute}`]);
    return false;
  }

  return true;
};
