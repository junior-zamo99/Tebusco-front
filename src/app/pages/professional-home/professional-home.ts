import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalHero } from '../../components/professional-hero/professional-hero';
import { ActiveProfiles } from '../../components/active-profiles/active-profiles';
import { PendingOffers } from '../../components/pending-offers/pending-offers';
import { RecentReview } from '../../components/recent-review/recent-review';
import { ProfessionalCta } from '../../components/professional-cta/professional-cta';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-professional-home',
  imports: [
    CommonModule,
    ProfessionalHero,
    ActiveProfiles,
    PendingOffers,
    RecentReview,
    ProfessionalCta
  ],
  templateUrl: './professional-home.html',
  styleUrl: './professional-home.css',
})
export class ProfessionalHome implements OnInit {

  userName: string = '';

  constructor(
    private storageService: StorageService
  ) {}


  ngOnInit(): void {
    const user = this.storageService.getUser();
    this.userName = user ? user.name : 'Profesional';
  }

}
