import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Importar Router
import { HeroComponent } from '../../components/hero/hero.component';
import { CategoriesCarouselComponent } from '../../components/categories-carousel/categories-carousel';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';

// IMPORTAR TUS SERVICIOS
import { ProfessionalService } from '../../services/professional.service';
import { StatusProfessionalService } from '../../services/statusProfessional.service';

@Component({
  selector: 'app-applicant-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeroComponent,
    CategoriesCarouselComponent
  ],
  templateUrl: './applicant-home.html',
  styleUrls: ['./applicant-home.css'],
})
export class ApplicantHome implements OnInit {
  userName: string = '';
  isLoadingRedirect = false; // Para evitar doble clic

  canBecomeProfessional = computed(() => this.authService.userType() === 1);

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private professionalService: ProfessionalService,
    private statusService: StatusProfessionalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.storageService.getUser();
    this.userName = user ? user.name : 'Usuario';
  }


  handleProfessionalRegistration() {
    if (this.isLoadingRedirect) return;
    this.isLoadingRedirect = true;

    this.professionalService.getMeComplete().subscribe({
      next: (response) => {

        console.log('Usuario ya tiene registro previo, redirigiendo...');
        this.statusService.processRedirection(response);
        this.isLoadingRedirect = false;
      },
      error: (err) => {
        console.log('Usuario nuevo, enviando a upgrade...');
        this.router.navigate(['/professional/upgrade']);
        this.isLoadingRedirect = false;
      }
    });
  }
}
