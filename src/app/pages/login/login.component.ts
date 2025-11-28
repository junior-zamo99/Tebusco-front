import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../interface/auth.interface';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService
  ) {}

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
      next: (response) => {
        this.isLoading.set(false);
        console.log('✅ Login exitoso', response);

        this.storageService.clearAll();
        const user = { ...response.data.user, phone: response.data.user.phone || '' };
        this.storageService.saveUser(user);

        if (response.data.applicant) {
          this.storageService.saveApplicant(response.data.applicant);
        }

        if (response.data.professional) {
          this.storageService.saveProfessional(response.data.professional);
        }

        this.redirectBasedOnUserType(response.data);
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
}
