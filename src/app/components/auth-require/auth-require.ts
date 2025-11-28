import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-auth-require',
  imports: [CommonModule],
  templateUrl: './auth-require.html',
  styleUrls: ['./auth-require.css'],
})
export class AuthRequire implements OnInit, OnDestroy {
  private redirectTimeout: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Redirección automática después de 3 segundos (sin mostrar el contador)
    this.redirectTimeout = setTimeout(() => {
      this.redirectToLogin();
    }, 3000);
  }

  ngOnDestroy(): void {
    // Limpiar el timer al destruir el componente
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }

  redirectToLogin(): void {
    // Limpia el timer
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }

    // Redirige al login
    this.router.navigate(['/login']);
  }

  goBack(): void {
    // Limpia el timer
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }

    // Volver a la página anterior
    window.history.back();
  }
}


