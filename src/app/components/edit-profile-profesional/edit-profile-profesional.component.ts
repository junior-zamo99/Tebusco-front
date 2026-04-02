import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfessionalService } from '../../services/professional.service';
import { ProfessionalCompleteData, UpdateProfessionalProfileDTO } from '../../models/professional-complete.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-edit-profile-profesional',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile-profesional.component.html',
  styleUrls: ['./edit-profile-profesional.component.css']
})
export class EditProfileProfesionalComponent implements OnInit {
  professionalData: ProfessionalCompleteData | null = null;
  loading = true;
  saving = false;
  error: string | null = null;
  imageLoadFailed = false;
  profileForm!: FormGroup;

  uploadingAvatar = false;
  selectedAvatarUrl: string | null = null;
  avatarPreview: string | null = null;

  constructor(
    private professionalService: ProfessionalService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfessionalData();
  }

  loadProfessionalData() {
    this.loading = true;
    this.professionalService.getMeComplete().subscribe({
      next: (response) => {
        if (response.success) {
          this.professionalData = response.data;
          this.initForm();
          this.imageLoadFailed = false;
        } else {
          this.error = response.message;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error de conexión';
        this.loading = false;
      }
    });
  }

  initForm() {
    const data = this.professionalData!;
    this.profileForm = this.fb.group({
      name: [data.user.name, [Validators.required]],
      lastName: [data.user.lastName, [Validators.required]],
      phone: [data.user.phone, [Validators.required]],
      whatsappNumber: [data.professional.whatsappNumber],
      websiteUrl: [data.professional.websiteUrl, [Validators.pattern(/^https?:\/\/.+/)]],
      facebookProfile: [data.professional.facebookProfile],
      instagramProfile: [data.professional.instagramProfile],
      linkedinProfile: [data.professional.linkedinProfile, [Validators.pattern(/^https?:\/\/.+/)]],
      youtubeChannel: [data.professional.youtubeChannel, [Validators.pattern(/^https?:\/\/.+/)]],
      bio: [data.professional.bio, [Validators.maxLength(500)]],
      visible: [data.professional.visible]
    });
  }

  onSubmitProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const updateData: UpdateProfessionalProfileDTO = this.profileForm.value;

    if (this.selectedAvatarUrl) {
      updateData.avatarUrl = this.selectedAvatarUrl;
    }
    this.professionalService.updateProfile(updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.saving = false;
          this.router.navigate(['/profile-professional-personal']);
        } else {
          this.saving = false;
          alert(response.message || 'Error al actualizar');
        }
      },
      error: (err) => {
        this.saving = false;
        alert(err.error?.message || 'Error al actualizar el perfil');
      }
    });
  }

  cancelEditing() {
    this.router.navigate(['/profile-professional-personal']);
  }

  isInvalid(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onAvatarSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (file.size > 7 * 1024 * 1024) {
      alert('La imagen no debe superar 7MB');
      return;
    }


    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarPreview = e.target.result;
    };
    reader.readAsDataURL(file);
    this.uploadingAvatar = true;
    this.professionalService.uploadAvatar(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedAvatarUrl = response.data.url;
          if (this.professionalData && this.professionalData.professional) {
            this.professionalData.professional.avatarUrl = response.data.url;
            this.professionalData.professional.avatarThumbnailUrl = response.data.thumbnailUrl || response.data.url;
          }
        }
        this.uploadingAvatar = false;
      },
      error: (err) => {
        alert('Error al subir la foto de perfil');
        console.error(err);
        this.uploadingAvatar = false;
      }
    });
  }

  getInitials(): string {
    if (!this.professionalData?.user) return '';
    const { name, lastName } = this.professionalData.user;
    return (name.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  handleImageError() {
    this.imageLoadFailed = true;
  }

  getAvatarThumbnailUrl(): string {
    if (this.avatarPreview) return this.avatarPreview;
    if (!this.professionalData?.professional?.avatarThumbnailUrl) return 'assets/default-avatar.png';
    if (this.professionalData.professional.avatarThumbnailUrl.startsWith('http')) return this.professionalData.professional.avatarThumbnailUrl;
    return `${environment.backendUrl}${this.professionalData.professional.avatarThumbnailUrl}`;
  }
}
