import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service'; // ✅ Importar
import {
  Applicant,
  AuthResponse,
  LoginRequest,
  MeResponse,
  Professional,
  RefreshResponse,
  RegisterRequest,
  User,
  UserAddress
} from '../interface/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  isAuthenticated = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  currentApplicant = signal<Applicant | null>(null);
  currentProfessional = signal<Professional | null>(null);
  currentAddresses = signal<UserAddress[]>([]);

  userType = computed<number>(() => {
    const hasApplicant = this.currentApplicant() !== null;
    const hasProfessional = this.currentProfessional() !== null;

    if (hasApplicant && hasProfessional) {
      return 2; // Usuario dual
    } else if (hasApplicant) {
      return 1;
    }
    return 0;
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.checkSession();
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this.loadingService.show('Registrando usuario...');

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/register`,
      data,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('Register response:', response);
        this.currentUser.set(response.data.user);
        this.currentApplicant.set(response.data.applicant);
        this.currentProfessional.set(response.data.professional || null);
        this.isAuthenticated.set(true);
        console.log('Usuario registrado:', response.data.user.name);
      }),
      catchError(error => {
        console.error('Error en register:', error);
        return throwError(() => error);
      }),
      finalize(() => this.loadingService.hide())
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    this.loadingService.show('Iniciando sesión...');

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      data,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('Login response:', response);

        this.currentUser.set(response.data.user);
        this.currentApplicant.set(response.data.applicant);
        this.currentProfessional.set(response.data.professional || null);

        if (response.data.userAddress) {
          this.currentAddresses.set([response.data.userAddress]);
        }

        this.isAuthenticated.set(true);

        console.log('Login exitoso:', response.data.user.name);
        console.log('UserType:', this.userType());
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return throwError(() => error);
      }),
      finalize(() => {
        setTimeout(() => this.loadingService.hide(), 500);
      })
    );
  }

  logout(): Observable<any> {
    this.loadingService.show('Cerrando sesión...'); // ✅

    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        console.log('Logout exitoso');

        this.currentUser.set(null);
        this.currentApplicant.set(null);
        this.currentProfessional.set(null);
        this.currentAddresses.set([]);
        this.isAuthenticated.set(false);

        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Error en logout:', error);

        this.currentUser.set(null);
        this.currentApplicant.set(null);
        this.currentProfessional.set(null);
        this.currentAddresses.set([]);
        this.isAuthenticated.set(false);

        this.router.navigate(['/login']);
        return throwError(() => error);
      }),
      finalize(() => {
        setTimeout(() => this.loadingService.hide(), 500); // ✅
      })
    );
  }

  getMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(
      `${this.apiUrl}/auth/me`,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('GetMe response:', response);

        this.currentUser.set(response.data.user);
        this.currentApplicant.set(response.data.applicant);
        this.currentProfessional.set(response.data.professional || null);
        this.currentAddresses.set(response.data.userAddresses);
        this.isAuthenticated.set(true);

        console.log('Sesión activa:', response.data.user.name);
      }),
      catchError(error => {
        console.log('No hay sesión activa');
        this.isAuthenticated.set(false);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(
      `${this.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('Token refrescado');
      }),
      catchError(error => {
        console.error('Error al refrescar token:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private checkSession(): void {
    if (typeof window === 'undefined') return;

    this.getMe().subscribe({
      next: (response) => {
        console.log('Sesión restaurada:', response.data.user.name);
      },
      error: () => {
        console.log('No hay sesión activa (normal si no has hecho login)');
        this.isAuthenticated.set(false);
      }
    });
  }
}
