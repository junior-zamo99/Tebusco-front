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
  addresses: UserAddress[] = [];

  activeTab: 'info' | 'addresses' | 'security' = 'info';
  isEditing: boolean = false;

  // Form data for editing
  editForm = {
    name: '',
    lastName: '',
    phone: '',
    email: ''
  };

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

    if (this.user) {
      this.editForm = {
        name: this.user.name,
        lastName: this.user.lastName,
        phone: this.user.phone || '',
        email: this.user.email
      };
    }
  }

  setActiveTab(tab: 'info' | 'addresses' | 'security'): void {
    this.activeTab = tab;
  }

  toggleEdit(): void {
    if (this.isEditing) {
      // Save changes
      console.log('Guardando cambios:', this.editForm);
      // TODO: Implementar llamada al API para actualizar perfil
    }
    this.isEditing = !this.isEditing;
  }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.user) {
      this.editForm = {
        name: this.user.name,
        lastName: this.user.lastName,
        phone: this.user.phone || '',
        email: this.user.email
      };
    }
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

  getDefaultAddress(): UserAddress | null {
    return this.addresses.find(addr => addr.isDefault) || this.addresses[0] || null;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
