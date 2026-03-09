import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, Applicant, UserAddress } from '../../interface/auth.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  applicant: Applicant | null = null;
  addresses: UserAddress | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.user = this.authService.currentUser();
    this.applicant = this.authService.currentApplicant();
    this.addresses = this.authService.currentAddresses();
  }

  onLogout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout().subscribe({
        next: () => {
          console.log('Sesión cerrada exitosamente');
        },
        error: (err) => {
          console.error('Error al cerrar sesión:', err);
        }
      });
    }
  }

  getInitials(): string {
    if (!this.user) return '??';
    return `${this.user.name.charAt(0)}${this.user.lastName.charAt(0)}`.toUpperCase();
  }

  getPhotoUrl(): string | null {
    return this.applicant?.photoMediumUrl || this.applicant?.photoUrl || null;
  }

  getSexLabel(): string {
    const sexMap: Record<string, string> = {
      'male': 'Masculino',
      'female': 'Femenino',
      'other': 'Otro'
    };
    return sexMap[this.user?.sex || ''] || 'No especificado';
  }


}
