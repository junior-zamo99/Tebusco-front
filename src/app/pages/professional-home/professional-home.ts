import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { ProfessionalHero } from '../../components/professional-hero/professional-hero';
import { ActiveProfiles } from '../../components/active-profiles/active-profiles';
import { HomeRequestProfessional } from '../../components/home-request-professional/home-request-professional';
import { PendingOffers } from '../../components/pending-offers/pending-offers';
import { RecentReview } from '../../components/recent-review/recent-review';
import { ProfessionalCta } from '../../components/professional-cta/professional-cta';
import { RegistrationStatusBannerComponent } from '../../components/registration-status-banner/registration-status-banner.component';
import { StorageService } from '../../services/storage.service';
import { ProfessionalService } from '../../services/professional.service';
import { ProfessionalCompleteData } from '../../models/professional-complete.model';

@Component({
  selector: 'app-professional-home',
  imports: [
    ProfessionalHero,
    ActiveProfiles,
    HomeRequestProfessional,
    PendingOffers,
    RecentReview,
    ProfessionalCta,
    RegistrationStatusBannerComponent
],
  templateUrl: './professional-home.html',
  styleUrl: './professional-home.css',
})
export class ProfessionalHome implements OnInit {
  userName: string = '';
  professionalData: ProfessionalCompleteData | null = null;
  loadingStatus = true;

  constructor(
    private storageService: StorageService,
    private professionalService: ProfessionalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.storageService.getUser();
    this.userName = user ? user.name : 'Profesional';
    this.loadProfessionalStatus();
  }


  loadProfessionalStatus(): void {
    this.loadingStatus = true;
    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        if (response.success) {
          this.professionalData = response.data;
        }
        this.loadingStatus = false;
      },
      error: (err) => {
        console.error('Error cargando estado del profesional:', err);
        this.loadingStatus = false;
      }
    });
  }



  onGoToPayment(): void {
    this.router.navigate(['/professional/plans']);
  }

  onGoToDocuments(): void {
    this.router.navigate(['/professional/profile/documents']);
  }

  onGoToCategories(): void {
    this.router.navigate(['/professional/profile/categories']);
  }

  onGoToProfile(): void {
    this.router.navigate(['/professional/profile/info']);
  }
}
