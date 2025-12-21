import { Component, OnInit, HostListener, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { LoadingService } from '../../services/loading.service';
import { SearchResult } from '../search-result/search-result';
import { DialogService } from '../../services/dialog.service';
import { ThemeService } from '../../services/theme.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SearchResult],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isUserMenuOpen = false;
  isSearchOpen = false;
  isViewDropdownOpen = false;
  searchTerm = '';
  notificationCount = 3;

  currentView: 'sa' | 'pl' = 'sa';

  userType = computed(() => this.authService.userType());
  canSwitchView = computed(() => this.userType() === 2);

  constructor(
    private router: Router,
    public authService: AuthService,
    private storageService: StorageService,
    private dialogService: DialogService,
    private loadingService: LoadingService,
    public themeService: ThemeService
  ) {
    effect(() => {
    const type = this.userType();
    if (type > 0) {
      const savedView = localStorage.getItem('current_view') as 'sa' | 'pl';
      if (savedView) {
        this.currentView = savedView;
      }
    }
  });
  }

  ngOnInit(): void {
    this.loadCurrentView();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

 loadCurrentView(): void {
  const savedView = localStorage.getItem('current_view') as 'sa' | 'pl';
  const type = this.userType();
  if (type === 0) {
    if (savedView) this.currentView = savedView;
    return;
  }

  if (savedView) {
    this.currentView = savedView;
  } else {
    this.currentView = (type === 2 || type === 1) ? 'sa' : 'pl';
    localStorage.setItem('current_view', this.currentView);
  }
}

  onLogoClick(): void {
    if (this.authService.isAuthenticated()) {
      if (this.currentView === 'pl') {
        this.router.navigate(['/professional/dashboard']);
      } else {
        this.router.navigate(['/applicant/dashboard']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  toggleViewDropdown(): void {
    this.isViewDropdownOpen = !this.isViewDropdownOpen;
  }

  selectView(view: 'sa' | 'pl'): void {
    this.loadingService.show(
      view === 'sa'
        ? 'Cambiando a modo Solicitante...'
        : 'Cambiando a modo Profesional...'
    );

    this.currentView = view;
    this.isViewDropdownOpen = false;
    localStorage.setItem('current_view', view);

    setTimeout(() => {
      this.navigateToDashboard(view);
    }, 300);
  }

  onViewChange(view: 'sa' | 'pl'): void {
    this.loadingService.show(
      view === 'sa'
        ? 'Cambiando a modo Solicitante...'
        : 'Cambiando a modo Profesional...'
    );

    this.currentView = view;
    localStorage.setItem('current_view', view);

    setTimeout(() => {
      this.navigateToDashboard(view);
    }, 300);
  }

  navigateToDashboard(view: 'sa' | 'pl'): void {
    if (view === 'pl') {
      this.router.navigate(['/professional/dashboard']).then(() => {
        setTimeout(() => this.loadingService.hide(), 500);
      });
    } else {
      this.router.navigate(['/applicant/dashboard']).then(() => {
        setTimeout(() => this.loadingService.hide(), 500);
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const viewSelector = document.querySelector('.view-selector');
    if (viewSelector && !viewSelector.contains(target)) {
      this.isViewDropdownOpen = false;
    }

    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(target)) {
      this.isSearchOpen = false;
    }

    const userMenuButton = document.querySelector('.user-menu-button');
    const userMenuDropdown = document.querySelector('.user-menu-dropdown');
    if (userMenuButton && userMenuDropdown) {
      if (!userMenuButton.contains(target) && !userMenuDropdown.contains(target)) {
        this.isUserMenuOpen = false;
      }
    }
  }

  photoUrl(): string {
    return environment.backendUrl + this.authService.currentUser()?.photoUrl;
  }

  onOffers(): void {
    this.router.navigate(['/offers']);
    this.isUserMenuOpen = false;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;

    if (this.searchTerm.trim().length >= 2) {
      this.isSearchOpen = true;
    } else {
      this.isSearchOpen = false;
    }
  }

  onSearchFocus(): void {
    if (this.searchTerm.trim().length >= 2) {
      this.isSearchOpen = true;
    }
  }

  closeSearchResults(): void {
    this.isSearchOpen = false;
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }

  onRegister(): void {
    this.router.navigate(['/register']);
  }

  onProfile(): void {
    if (this.currentView === 'pl') {
      this.router.navigate(['/profile-professional-personal']);
    } else {
      this.router.navigate(['/profile']);
      this.isUserMenuOpen = false;
    }
  }

  onLogout(): void {
    this.dialogService.confirm(
      '¿Cerrar sesión?',
      '¿Estás seguro que deseas cerrar tu sesión actual? Deberás iniciar sesión nuevamente para acceder.',
      'Sí, cerrar sesión',
      'Cancelar'
    ).subscribe(result => {
      if (result.confirmed) {
        this.isUserMenuOpen = false;

        this.authService.logout().subscribe(() => {
          this.storageService.clearAll();
          localStorage.removeItem('current_view');
          this.currentView = 'sa';
          localStorage.removeItem('type_of_user');
          this.router.navigate(['/']);
        });
      }
    });
  }

  onRequests(): void {
    this.router.navigate(['/requests']);
    this.isUserMenuOpen = false;
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '??';
    return `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getUserName(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    return `${user.name} ${user.lastName}`;
  }
}
