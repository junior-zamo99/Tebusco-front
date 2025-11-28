import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeroComponent } from '../../components/hero/hero.component';
import { CategoriesCarouselComponent } from '../../components/categories-carousel/categories-carousel';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';

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

  canBecomeProfessional = computed(() => this.authService.userType() === 1);

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.storageService.getUser();
    this.userName = user ? user.name : 'Usuario';
  }
}
