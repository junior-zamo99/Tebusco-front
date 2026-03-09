import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ProfessionalPublicService } from '../../services/professional-public.service';
import { ProfileViewsService } from '../../services/profile-views.service';
import { StorageService } from '../../services/storage.service';

import { PublicProfessionalWithSelectedProfiles } from '../../interface/professional-public.interface';
import { LocationData, MapLocationViewer } from '../map-location-viewer/map-location-viewer';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-professional-detail',
  imports: [CommonModule, MapLocationViewer],
  templateUrl: './professional-detail.html',
  styleUrl: './professional-detail.css',
})
export class ProfessionalDetailComponent implements OnInit {
  professional: PublicProfessionalWithSelectedProfiles | null = null;
  loading = true;
  error: string | null = null;
  showContactModal = false;
  showImageModal = false;

  professionalId!: number;
  categoryIds: number[] = [];
  backendUrl = environment.backendUrl;
  locationData: LocationData | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private professionalService: ProfessionalPublicService,
    private profileViewsService: ProfileViewsService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.professionalId = +params['id'];
      this.trackView();

      this.route.queryParams.subscribe(queryParams => {
        if (queryParams['categoryIds']) {
          this.categoryIds = queryParams['categoryIds']
            .split(',')
            .map((id: string) => +id)
            .filter((id: number) => !isNaN(id));
        }

        if (this.categoryIds.length > 0) {
          this.loadProfessionalWithCategories();
        } else {
          this.loadFullProfessional();
        }
      });
    });
  }

  private trackView(): void {
    if (!this.storageService.isUserLoggedIn()) {
      return;
    }

    const applicantData = this.storageService.getApplicant();

    if (applicantData) {
      this.profileViewsService.registerView(this.professionalId).subscribe({
        next: () => {
          console.log('👀 Vista de perfil registrada correctamente');
        },
        error: (err) => {
          console.warn('No se pudo registrar la vista:', err);
        }
      });
    } else {
      console.log('El usuario actual no es un Applicant, no se registra la vista.');
    }
  }


  loadProfessionalWithCategories(): void {
    this.loading = true;
    this.error = null;

    this.professionalService.getProfessionalWithCategories(
      this.professionalId,
      this.categoryIds
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.professional = response.data;
          this.prepareLocationData();
          this.loading = false;
        } else {
          this.error = 'No se pudo cargar la información del profesional';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading professional:', err);
        this.error = 'Error al cargar los datos del profesional';
        this.loading = false;
      }
    });
  }

  loadFullProfessional(): void {
    this.loading = true;
    this.error = null;

    this.professionalService.getProfessionalById(this.professionalId).subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data as any;
          this.professional = {
            id: data.id,
            fullName: data.fullName,
            avatarUrl: data.avatarUrl,
            avatarMediumUrl: data.avatarMediumUrl,
            avatarThumbnailUrl: data.avatarThumbnailUrl,
            email: data.email || '',
            phone: data.phone || '',
            isVerified: data.isVerified,
            isPromocional: data.isPromocional,
            location: data.location ? {
              city: data.location.cityName || data.location.city,
              country: data.location.countryName || data.location.country,
              state: null,
              address: null,
              fullAddress: null,
              lat: 0,
              lng: 0,
              label: ''
            } : null,
            profiles: data.categories,
            subscription: data.subscription,
            publicDocuments: data.publicDocuments,
            stats: {
              totalCategories: data.stats.activeCategories,
              selectedCategories: data.stats.activeCategories
            },
            createdAt: data.createdAt,
            professional: data.Professional
          } as any;
          this.prepareLocationData();
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading professional:', err);
        this.error = 'Error al cargar los datos del profesional';
        this.loading = false;
      }
    });
  }

  private prepareLocationData(): void {
    if (this.professional?.location && this.professional.location.lat && this.professional.location.lng) {
      this.locationData = {
        lat: +this.professional.location.lat,
        lng: +this.professional.location.lng,
        city: this.professional.location.city,
        state: this.professional.location.state ?? undefined,
        country: this.professional.location.country,
        address: this.professional.location.address ?? undefined,
        fullAddress: this.professional.location.fullAddress ?? undefined,
        label: this.professional.location.label
      };
    }
  }

  getInitials(fullName: string): string {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  openDocument(url: string): void {
    window.open(this.backendUrl + url, '_blank');
  }

  contactProfessional(): void {
    this.showContactModal = true;
  }

  closeContactModal(): void {
    this.showContactModal = false;
  }

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  copyToClipboard(text: string, type: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log(`${type} copiado al portapapeles: ${text}`);
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  get professionalInfo() {
    if (!this.professional) return null;

    return {
      whatsappNumber: (this.professional as any).professional?.whatsappNumber,
      websiteUrl: (this.professional as any).professional?.websiteUrl,
      facebookProfile: (this.professional as any).professional?.facebookProfile,
      instagramProfile: (this.professional as any).professional?.instagramProfile,
      linkedinProfile: (this.professional as any).professional?.linkedinProfile,
      youtubeChannel: (this.professional as any).professional?.youtubeChannel,
      businessEmail: (this.professional as any).professional?.businessEmail,
    };
  }

  photoUrl() {
    return this.professional?.avatarThumbnailUrl || null;
  }

  fullPhotoUrl() {
    return this.professional?.avatarUrl || null;
  }

  openImageModal(): void {
    if (this.professional?.avatarUrl) {
      this.showImageModal = true;
    }
  }

  closeImageModal(): void {
    this.showImageModal = false;
  }

  openWhatsApp(): void {
    const info = this.professionalInfo;

    if (!this.professional || !info || !info.whatsappNumber) {
      return;
    }

    const profName = this.professional.fullName || 'Profesional';
    const profiles = this.professional.profiles || [];
    let contextMessage = '';

    if (profiles.length === 1) {
      const categoryName = profiles[0].categoryName;
      contextMessage = ` para servicios de *${categoryName}*`;
    } else {
      contextMessage = `, necesito tus servicios`;
    }

    const message = `Hola *${profName}*, te vi en la app *TEBUSCO* ${contextMessage}. ¿Podrías darme más información?`;
    const url = this.createWhatsAppLink(info.whatsappNumber, message);

    window.open(url, '_blank');
  }

  createWhatsAppLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
}
