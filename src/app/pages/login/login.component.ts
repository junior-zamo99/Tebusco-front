import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interface/auth.interface';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  oauthError = signal<string>('');

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    // Verificar si hay error de OAuth en los query params
    this.route.queryParams.subscribe(params => {
      if (params['oauth'] === 'error') {
        this.oauthError.set(params['message'] || 'Error en el login social. Por favor intenta nuevamente.');
      }
    });
  }

  onSubmit(): void {
    this.errorMessage.set('');

    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage.set('Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginData.email)) {
      this.errorMessage.set('El email no es válido');
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        this.isLoading.set(false);

        this.storageService.clearAll();
        const response = res.data;

        if (response.user) {
            const user = { ...response.user, phone: response.user.phone || '' };
            this.storageService.saveUser(user);
        }

        if (response.applicant) {
          const applicant = {
            ...response.applicant,
            city: response.applicant.city ?? { id: 0, name: '', code: '', country: undefined }
          };
          this.storageService.saveApplicant(applicant);
        }

        if (response.professional) {
          console.log('🔄 Guardando professional en StorageService');
          this.storageService.saveProfessional(response.professional);
        }

        if (response.userAddress) {
          this.storageService.saveUserAddress(response.userAddress);
          const verificacion = this.storageService.getUserAddress();
          if (!verificacion) {
            console.error('❌ ERROR: UserAddress NO se guardó correctamente!');
          }
        } else {
          console.warn('⚠️ No hay userAddress en la respuesta');
        }

        this.redirectBasedOnUserType(response);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Error al iniciar sesión');
        console.error('❌ Error en login:', error);
      }
    });
  }

  private redirectBasedOnUserType(data: any): void {
    const hasApplicant = !!data.applicant;
    const hasProfessional = !!data.professional;

    if (hasApplicant && hasProfessional) {
      this.storageService.saveTypeOfUser({ keyType: 2 });

      localStorage.setItem('current_view', 'sa');

      console.log('🔄 Usuario dual detectado, iniciando como solicitante en /applicant/dashboard');
      this.router.navigate(['/applicant/dashboard']);
    } else if (hasApplicant && !hasProfessional) {
      this.storageService.saveTypeOfUser({ keyType: 1 });

      localStorage.setItem('current_view', 'sa');

      console.log('🔄 Usuario solicitante detectado, redirigiendo a /applicant/dashboard');
      this.router.navigate(['/applicant/dashboard']);
    } else {
      console.log('⚠️ Usuario sin roles definidos, redirigiendo a home');
      this.router.navigate(['/']);
    }
  }

  // Métodos para OAuth social login
  loginWithGoogle(): void {
    window.location.href = `${environment.backendUrl}/api/auth/google/start`;
  }

  loginWithFacebook(): void {
    window.location.href = `${environment.backendUrl}/api/auth/facebook/start`;
  }
}

