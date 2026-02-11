import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import { StorageService } from './storage.service';

// Asegúrate de que tus interfaces estén actualizadas como las definimos en el paso anterior
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Applicant,
  Professional,
  UserAddress,
  backendResponse
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
  currentAddresses = signal<UserAddress | null>(null);
  isInitialLoading = signal<boolean>(true);

  userType = computed<number>(() => {
    const hasApplicant = this.currentApplicant() !== null;
    const hasProfessional = this.currentProfessional() !== null;

    if (hasApplicant && hasProfessional) return 2;
    if (hasApplicant) return 1;
    return 0;
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingService: LoadingService,
    private storageService: StorageService
  ) {
    this.checkSession();
  }

  // --- REGISTER ---
  register(data: RegisterRequest): Observable<backendResponse> {
    this.loadingService.show('Registrando usuario...');

    return this.http.post<backendResponse>(
      `${this.apiUrl}/auth/register`,
      data,
      { withCredentials: true }
    ).pipe(
      tap(res => {
        console.log('Register response:', res);
        const response = res.data
        this.currentUser.set(response.user);
        this.currentApplicant.set(response.applicant);
        this.currentProfessional.set(response.professional || null);

        if (response.userAddress) {
            this.currentAddresses.set(response.userAddress);
        }

        this.isAuthenticated.set(true);
        console.log('Usuario registrado:', response.user.name);
      }),
      catchError(error => {
        console.error('Error en register:', error);
        return throwError(() => error);
      }),
      finalize(() => this.loadingService.hide())
    );
  }


  login(data: LoginRequest): Observable<backendResponse> {
    this.loadingService.show('Iniciando sesión...');

    return this.http.post<backendResponse>(
      `${this.apiUrl}/auth/login`,
      data,
      { withCredentials: true }
    ).pipe(
      tap(res => {
        console.log('Login response:', res);
        const response = res.data;
        if(response.user){
           this.currentUser.set(response.user);
        }

        this.currentApplicant.set(response.applicant);
        this.currentProfessional.set(response.professional || null);
        this.currentAddresses.set(response.userAddress || null);

        this.isAuthenticated.set(true);

        console.log('Login exitoso:', response.user.name);
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

  // --- LOGOUT ---
  logout(): Observable<any> {
    this.loadingService.show('Cerrando sesión...');

    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        console.log('Logout exitoso');
        this.clearState();
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Error en logout:', error);
        this.clearState();
        this.router.navigate(['/login']);
        return throwError(() => error);
      }),
      finalize(() => {
        setTimeout(() => this.loadingService.hide(), 500);
      })
    );
  }

  // --- GET ME ---
  getMe(): Observable<any> { // Usamos any o crea una interfaz GetMeResponse que coincida con tu backend
    return this.http.get<any>(
      `${this.apiUrl}/auth/me`,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('GetMe response:', response);

        // Manejar respuesta que puede venir con o sin 'data' wrapper
        const userData = response.data || response;

        console.log('GetMe userData extraído:', userData);

        // Ajusta esto si tu endpoint /me devuelve algo distinto
        this.currentUser.set(userData.user);
        this.currentApplicant.set(userData.applicant);
        this.currentProfessional.set(userData.professional || null);

        // Si /me devuelve array de direcciones
        if (userData.userAddresses && userData.userAddresses.length > 0) {
             // Tomamos la primera o la default
             this.currentAddresses.set(userData.userAddresses[0]);
        } else if (userData.userAddress) {
             this.currentAddresses.set(userData.userAddress);
        }

        this.isAuthenticated.set(true);
        console.log('Sesión activa:', userData.user?.name || 'Usuario');
      }),
      catchError(error => {
        console.log('No hay sesión activa', error);
        this.isAuthenticated.set(false);
        return throwError(() => error);
      })
    );
  }

  // --- CHECK SESSION ---
  private checkSession(): void {
    if (typeof window === 'undefined') {
      this.isInitialLoading.set(false);
      return;
    }

    this.getMe().pipe(
      finalize(() => this.isInitialLoading.set(false))
    ).subscribe({
      next: (response) => {
        // CORRECCIÓN: Acceso directo
        console.log('Sesión restaurada:', response.user.name);
      },
      error: () => {
        console.log('No hay sesión activa');
        this.isAuthenticated.set(false);
      }
    });
  }

  refreshToken(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap((response: any) => {
        console.log('Token refrescado correctamente');
        // Si el refresh devuelve nuevo token o usuario, actualiza aquí si es necesario
      }),
      catchError(error => {
        // Si falla el refresh, cerramos sesión
        this.doLogout();
        return throwError(() => error);
      })
    );
  }

  // --- HELPERS ---
  private clearState() {
    this.currentUser.set(null);
    this.currentApplicant.set(null);
    this.currentProfessional.set(null);
    this.currentAddresses.set(null);
    this.isAuthenticated.set(false);
    this.storageService.clearAll();
  }

  private doLogout() {
    this.currentUser.set(null);
    this.currentApplicant.set(null);
    this.currentProfessional.set(null);
    this.currentAddresses.set(null);
    this.isAuthenticated.set(false);
    this.storageService.clearAll();
    this.router.navigate(['/login']);
  }

  updateProfessionalState(professional: Professional): void {
    this.currentProfessional.set(professional);
  }
}
