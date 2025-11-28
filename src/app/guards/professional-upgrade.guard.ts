import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProfessionalService } from '../services/professional.service';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalUpgradeGuard implements CanActivate {
  constructor(
    private professionalService: ProfessionalService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.professionalService.getProfessionalStatus().pipe(
      map((response: any) => {
        const status = response.data;

        if (!status.isProfessional) {
          return true;
        }

        if (status.status === 'active') {
          this.router.navigate(['/professional/dashboard']);
          return false;
        }

        return true;
      }),
      catchError(() => {
        return of(true);
      })
    );
  }
}
