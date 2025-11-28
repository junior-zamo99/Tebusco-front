import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfessionalPublicService } from '../../services/professional-public.service';
import { PublicProfessionalWithSelectedProfiles } from '../../interface/professional-public.interface';
import { LocationData, MapLocationViewer } from '../map-location-viewer/map-location-viewer';
import { MapLocationPickerComponent } from '../map-location-picker/map-location-picker';

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
  showContactModal = false; // Nueva propiedad para controlar el modal

  professionalId! : number;
  categoryIds: number[] = [];
  backendUrl = 'http://localhost:3000';
  locationData: LocationData | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private professionalService: ProfessionalPublicService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.professionalId = +params['id'];

      this.route.queryParams.subscribe(queryParams => {
        if (queryParams['categoryIds']) {
          this.categoryIds = queryParams['categoryIds']
            .split(',')
            .map((id: string) => +id)
            .filter((id: number) => ! isNaN(id));
        }

        if (this.categoryIds.length > 0) {
          this.loadProfessionalWithCategories();
        } else {
          this.loadFullProfessional();
        }
      });
    });
  }

  loadProfessionalWithCategories(): void {
    this.loading = true;
    this.error = null;

    this.professionalService.getProfessionalWithCategories(
      this.professionalId,
      this.categoryIds
    ). subscribe({
      next: (response) => {
        if (response.success) {
          this.professional = response.data;
          this. prepareLocationData();
          this.loading = false;
        } else {
          this.error = 'No se pudo cargar la información del profesional';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading professional:', err);
        this. error = 'Error al cargar los datos del profesional';
        this.loading = false;
      }
    });
  }

  loadFullProfessional(): void {
    this.loading = true;
    this.error = null;

    this.professionalService.getProfessionalById(this.professionalId).subscribe({
      next: (response) => {
        if (response. success) {
          const data = response.data;
          this.professional = {
            id: data.id,
            fullName: data.fullName,
            photoUrl: data.photoUrl,
            email: '',
            phone: '',
            isVerified: data.isVerified,
            location: data.location,
            profiles: data.categories,
            subscription: data.subscription,
            publicDocuments: data.publicDocuments,
            stats: {
              totalCategories: data.stats.activeCategories,
              selectedCategories: data.stats.activeCategories
            },
            createdAt: data.createdAt
          };
          this.prepareLocationData();
          this.loading = false;
        }
      },
      error: (err) => {
        console. error('Error loading professional:', err);
        this.error = 'Error al cargar los datos del profesional';
        this.loading = false;
      }
    });
  }

  private prepareLocationData(): void {
    if (this.professional?. location && this.professional. location.lat && this.professional.location.lng) {
      this.locationData = {
        lat: this. professional.location.lat,
        lng: this.professional.location. lng,
        city: this.professional.location.city,
        state: this.professional.location.state ??  undefined,
        country: this.professional.location.country,
        address: this.professional.location.address ??  undefined,
        fullAddress: this.professional.location. fullAddress ?? undefined,
        label: this.professional.location.label
      };
    }
  }

  getInitials(fullName: string): string {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0]. charAt(0)}${names[1].charAt(0)}`. toUpperCase();
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
    this. showContactModal = false;
  }

  // Método para abrir enlaces externos
  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Método para copiar al portapapeles
  copyToClipboard(text: string, type: string): void {
    navigator.clipboard.writeText(text). then(() => {
      // Aquí podrías mostrar un toast de confirmación
      console.log(`${type} copiado al portapapeles: ${text}`);
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }


  get professionalInfo() {
    if (!this.professional) return null;

    return {
      whatsappNumber: (this.professional as any).professional?. whatsappNumber,
      websiteUrl: (this.professional as any).professional?.websiteUrl,
      facebookProfile: (this.professional as any). professional?.facebookProfile,
      instagramProfile: (this.professional as any).professional?.instagramProfile,
      linkedinProfile: (this.professional as any).professional?.linkedinProfile,
      youtubeChannel: (this.professional as any). professional?.youtubeChannel,
      businessEmail: (this.professional as any). professional?.businessEmail,
    };
  }

  photoUrl(){
    return this.backendUrl + this.professional?.photoUrl;
  }
}
