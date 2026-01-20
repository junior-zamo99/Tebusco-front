import { Component, OnInit, AfterViewInit, computed } from '@angular/core'; // 1. Importar AfterViewInit
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HeroComponent } from '../../components/hero/hero.component';
import { CategoriesCarouselComponent } from '../../components/categories-carousel/categories-carousel';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { ProfessionalService } from '../../services/professional.service';
import { StatusProfessionalService } from '../../services/statusProfessional.service';
import { HomeHeroApplicant } from '../../components/home-hero-applicant/home-hero-applicant';
import { AdsCarousel } from '../../components/ads-carousel/ads-carousel';
import { HomeRequestApplicant } from '../../components/home-request-applicant/home-request-applicant';
import { AddressDialogService } from '../../services/address-dialog.service';

@Component({
  selector: 'app-applicant-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeroComponent,
    CategoriesCarouselComponent,
    HomeHeroApplicant,
    AdsCarousel,
    HomeRequestApplicant
  ],
  templateUrl: './applicant-home.html',
  styleUrls: ['./applicant-home.css'],
})
// 2. Implementar la interfaz AfterViewInit
export class ApplicantHome implements OnInit {
  userName: string = '';
  isLoadingRedirect = false;

  canBecomeProfessional = computed(() => this.authService.userType() === 1);

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private professionalService: ProfessionalService,
    private statusService: StatusProfessionalService,
    private router: Router,
    private addressDialogService: AddressDialogService
  ) {}

  ngOnInit(): void {
    const user = this.storageService.getUser();
    this.userName = user ? user.name : 'Usuario';
  }




  async checkAddressModal() {

    if (this.isLoadingRedirect) return;

    const messageStatus = this.storageService.getMessageAddress();

    if (messageStatus !== 'S') {
      const addressSelected = await this.addressDialogService.open();

      if (addressSelected) {
        this.storageService.saveMessageAddress('S');
      } else {
        this.storageService.saveMessageAddress('N');
      }
    }
  }

  handleProfessionalRegistration() {
    if (this.isLoadingRedirect) return;
    this.isLoadingRedirect = true;

    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        this.statusService.processRedirection(response);
        this.isLoadingRedirect = false;
      },
      error: (err) => {
        this.router.navigate(['/professional/upgrade']);
        this.isLoadingRedirect = false;
      }
    });
  }

  openAddressModalManual() {
    console.log('Click recibido en el padre');
    this.addressDialogService.open();
  }

  onNavigateCreateRequest(){
    this.router.navigate(['applicant/request/create']);
  }
}
