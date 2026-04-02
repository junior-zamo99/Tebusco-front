import { Component, OnInit, signal } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.css']
})
export class AuthCallbackComponent implements OnInit {
  status = signal<'loading' | 'success' | 'error'>('loading');
  message = signal<string>('Verificando sesión...');

  constructor(
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.handleOAuthCallback();
  }

  private handleOAuthCallback(): void {
    // Esperar un poco para asegurar que las cookies se establecieron
    setTimeout(() => {
      this.authService.getMe().subscribe({
        next: (response) => {
          console.log('✅ OAuth login exitoso - RESPONSE COMPLETA:', response);
          console.log('✅ response.user:', response.user);
          console.log('✅ response.applicant:', response.applicant);
          console.log('✅ response.professional:', response.professional);

          // Manejar respuesta que puede venir con o sin 'data' wrapper
          const userData = response.data || response;
          
          console.log('📦 userData extraído:', userData);

          // Guardar datos en storage
          this.storageService.clearAll();

          if (userData.user) {
            const user = { ...userData.user, phone: userData.user.phone || '' };
            this.storageService.saveUser(user);
          }

          if (userData.applicant) {
            const applicant = {
              ...userData.applicant,
              city: userData.applicant.city ?? { id: 0, name: '', code: '', country: undefined }
            };
            this.storageService.saveApplicant(applicant);
          }

          if (userData.professional) {
            console.log('🔄 Guardando professional en StorageService');
            this.storageService.saveProfessional(userData.professional);
          }

          if (userData.userAddress || userData.userAddresses) {
            const address = userData.userAddress || (userData.userAddresses && userData.userAddresses[0]);
            if (address) {
              this.storageService.saveUserAddress(address);
            }
          }

          // Actualizar estado
          this.status.set('success');
          this.message.set('¡Login exitoso! Redirigiendo...');

          // Redirigir según el tipo de usuario
          setTimeout(() => {
            this.redirectBasedOnUserType(userData);
          }, 1000);
        },
        error: (error) => {
          console.error('❌ Error en OAuth callback:', error);
          this.status.set('error');
          this.message.set('Error al verificar la sesión. Redirigiendo a login...');

          // Redirigir a login con mensaje de error
          setTimeout(() => {
            this.router.navigate(['/login'], { 
              queryParams: { oauth: 'error', message: 'No se pudo completar el login social' }
            });
          }, 2000);
        }
      });
    }, 500);
  }

  private redirectBasedOnUserType(data: any): void {
    const hasApplicant = !!data.applicant;
    const hasProfessional = !!data.professional;

    if (hasApplicant && hasProfessional) {
      this.storageService.saveTypeOfUser({ keyType: 2 });
      localStorage.setItem('current_view', 'sa');
      console.log('🔄 Usuario dual detectado, redirigiendo a /applicant/dashboard');
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
}
