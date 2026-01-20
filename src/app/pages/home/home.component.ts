import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage.service';

import { HeroComponent } from '../../components/hero/hero.component';
import { ActiveProfiles } from '../../components/active-profiles/active-profiles';
import { PendingOffers } from '../../components/pending-offers/pending-offers';
import { ProfessionalCta } from '../../components/professional-cta/professional-cta';
import { ProfessionalHero } from '../../components/professional-hero/professional-hero';
import { RecentReview } from '../../components/recent-review/recent-review';
import { CategorySelectorComponent } from '../../components/category-selector/category-selector';
import { PlansSectionComponent } from '../../components/plan-section/plan-section';
import { CategoriesCarouselComponent } from '../../components/categories-carousel/categories-carousel';
import { LoadingScreen } from '../../components/loading-screen/loading-screen';
import { HeroSolicitante } from '../../components/hero-solicitante/hero-solicitante';
import { HeroProfessional } from '../../components/hero-professional/hero-professional';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeroComponent,
    ProfessionalHero,
    PlansSectionComponent,
    CategoriesCarouselComponent,
    ActiveProfiles,
    PendingOffers,
    RecentReview,
    ProfessionalCta,
    LoadingScreen,
    HeroSolicitante,
    HeroProfessional,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  currentView: 'applicant' | 'professional' = 'applicant';
  userType: number = 0;
  isLoading: boolean = true;
  isChangingView: boolean = false;

  private viewCheckInterval: any;
  private lastView: 'applicant' | 'professional' = 'applicant';

  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    setTimeout(() => {
      this.loadUserView();

      this.simulateLoading();
    }, 100);

    this.viewCheckInterval = setInterval(() => {
      this.checkViewChange();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.viewCheckInterval) {
      clearInterval(this.viewCheckInterval);
    }
  }

  loadUserView(): void {
    const savedView = localStorage.getItem('current_view');
    if (savedView === 'applicant' || savedView === 'professional') {
      this.currentView = savedView;
      this.lastView = savedView;
    }

    const typeOfUser = this.storageService.getTypeOfUser();
    if (typeOfUser) {
      this.userType = typeOfUser.keyType;
    }
  }

  checkViewChange(): void {
    const savedView = localStorage.getItem('current_view');
    if (savedView && savedView !== this.lastView) {
      console.log('Cambio de vista detectado:', savedView);

      this.isChangingView = true;
      this.lastView = savedView as 'applicant' | 'professional';

      setTimeout(() => {
        this.currentView = savedView as 'applicant' | 'professional';

        setTimeout(() => {
          this.isChangingView = false;
        }, 800);
      }, 300);
    }
  }

  simulateLoading(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  startProfessionalRegistration(): void {
    if (this.storageService.isUserLoggedIn()) {
      this.router.navigate(['/professional/register']);
    } else {
      alert('Debes iniciar sesión primero');
    }
  }
}
