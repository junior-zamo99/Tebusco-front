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
  backendResponse,
  UpdateApplicantDTO
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
        console.log('Sesión restaurada:', response.data.user.name);
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
      }),
      catchError(error => {
        this.doLogout();
        return throwError(() => error);
      })
    );
  }

  updateApplicant(id:number, data:UpdateApplicantDTO): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/applicants/${id}`,
      data,
      { withCredentials: true }
    ).pipe(
      tap((response: any) => {
        console.log('Applicant actualizado correctamente');

        const updatedData = response.data;

        this.currentApplicant.set(updatedData);

        if (updatedData.user) {
          this.currentUser.set(updatedData.user);

          // 3. Sincronizar User en localStorage
          this.storageService.saveUser({
            id: updatedData.user.id,
            name: updatedData.user.name,
            lastName: updatedData.user.lastName,
            email: updatedData.user.email,
            phone: updatedData.user.phone || '',
            photoUrl: updatedData.user.photoUrl,
            status: updatedData.user.status
          });

          console.log('User actualizado en localStorage');
        }

        // 4. Sincronizar Applicant en localStorage
        this.storageService.saveApplicant({
          id: updatedData.id,
          ci: updatedData.ci,
          isFrequentCustomer: updatedData.isFrequentCustomer,
          city: updatedData.city || undefined,
          photoUrl: updatedData.photoUrl || null,
          photoMediumUrl: updatedData.photoMediumUrl || null,
          photoThumbnailUrl: updatedData.photoThumbnailUrl || null
        });

        console.log('Applicant actualizado en localStorage');
      }),
      catchError(error => {
        console.error('Error al actualizar applicant:', error);
        return throwError(() => error);
      })
    );
  }

  updateApplicantWithFile(id: number, data: UpdateApplicantDTO, file?: File): Observable<any> {
    const formData = new FormData();

    if (data.name !== undefined) formData.append('name', data.name);
    if (data.lastName !== undefined) formData.append('lastName', data.lastName);
    if (data.phone !== undefined && data.phone !== null) formData.append('phone', data.phone);
    if (data.cityId !== undefined && data.cityId !== null) formData.append('cityId', String(data.cityId));
    if (data.sex !== undefined) formData.append('sex', data.sex);
    if (data.ci !== undefined && data.ci !== null) formData.append('ci', data.ci);

    if (file) {
      formData.append('photo', file, file.name);
      console.log('Archivo agregado al FormData:', file.name, file.type, file.size);
    }

    console.log('FormData entries:');
    formData.forEach((value, key) => {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
    });

    return this.http.put(
      `${this.apiUrl}/applicants/${id}`,
      formData,
      { withCredentials: true }
    ).pipe(
      tap((response: any) => {
        console.log('Applicant actualizado correctamente (con archivo)');

        const updatedData = response.data;

        this.currentApplicant.set(updatedData);

        if (updatedData.user) {
          this.currentUser.set(updatedData.user);

          this.storageService.saveUser({
            id: updatedData.user.id,
            name: updatedData.user.name,
            lastName: updatedData.user.lastName,
            email: updatedData.user.email,
            phone: updatedData.user.phone || '',
            photoUrl: updatedData.user.photoUrl,
            status: updatedData.user.status
          });
        }

        this.storageService.saveApplicant({
          id: updatedData.id,
          ci: updatedData.ci,
          isFrequentCustomer: updatedData.isFrequentCustomer,
          city: updatedData.city || undefined,
          photoUrl: updatedData.photoUrl || null,
          photoMediumUrl: updatedData.photoMediumUrl || null,
          photoThumbnailUrl: updatedData.photoThumbnailUrl || null
        });
      }),
      catchError(error => {
        console.error('Error al actualizar applicant con archivo:', error);
        return throwError(() => error);
      })
    );
  }

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
