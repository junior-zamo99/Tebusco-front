import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfessionalService } from '../../services/professional.service';
import { FileService } from '../../services/file.service';
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

  uploadingPhoto = false;
  uploadingAvatar = false;
  selectedPhotoUrl: string | null = null;
  selectedAvatarUrl: string | null = null;

  constructor(
    private professionalService: ProfessionalService,
    private fileService: FileService,
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
      businessEmail: [data.professional.businessEmail, [Validators.email]],
      websiteUrl: [data.professional.websiteUrl, [Validators.pattern(/^https?:\/\/.+/)]],
      facebookProfile: [data.professional.facebookProfile],
      instagramProfile: [data.professional.instagramProfile],
      linkedinProfile: [data.professional.linkedinProfile, [Validators.pattern(/^https?:\/\/.+/)]],
      youtubeChannel: [data.professional.youtubeChannel, [Validators.pattern(/^https?:\/\/.+/)]],
      bio: [data.professional.bio, [Validators.maxLength(500)]],
      totalExperience: [data.professional.totalExperience, [Validators.min(0), Validators.max(100)]],
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

    if (this.selectedPhotoUrl) {
      updateData.photoUrl = this.selectedPhotoUrl;
    }

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

  onPhotoSelect(event: Event) {
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

    this.uploadingPhoto = true;

    this.fileService.uploadPhoto(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedPhotoUrl = response.data.url;
          if (this.professionalData && this.professionalData.user) {
            this.professionalData.user.photoUrl = response.data.url;
          }
        }
        this.uploadingPhoto = false;
      },
      error: (err) => {
        alert('Error al subir la imagen');
        console.error(err);
        this.uploadingPhoto = false;
      }
    });
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

    this.uploadingAvatar = true;

    this.fileService.uploadAvatar(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedAvatarUrl = response.data.url;
          if (this.professionalData && this.professionalData.professional) {
            this.professionalData.professional.avatarUrl = response.data.url;
          }
        }
        this.uploadingAvatar = false;
      },
      error: (err) => {
        alert('Error al subir el logo');
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

  getAvatarUrl(): string {
    if (!this.professionalData?.professional?.avatarUrl) return 'assets/default-business.png';
    if (this.professionalData.professional.avatarUrl.startsWith('http')) return this.professionalData.professional.avatarUrl;
    return `${environment.backendUrl}${this.professionalData.professional.avatarUrl}`;
  }

  getPhotoUrl(): string {
    if (!this.professionalData?.user?.photoUrl) return 'assets/default-avatar.png';
    if (this.professionalData.user.photoUrl.startsWith('http')) return this.professionalData.user.photoUrl;
    return `${environment.backendUrl}${this.professionalData.user.photoUrl}`;
  }
}
