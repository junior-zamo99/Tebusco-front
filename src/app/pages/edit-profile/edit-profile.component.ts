import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';
import { DialogService } from '../../services/dialog.service';
import { PhoneInput } from '../../components/phone-input/phone-input';
import { Country, City } from '../../models/location.model';
import { Sex, UpdateApplicantDTO, User, Applicant, Professional } from '../../interface/auth.interface';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PhoneInput],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  countries: Country[] = [];
  cities: City[] = [];
  phoneData: any = null;

  saving = false;
  loading = true;

  // Imagen de perfil
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  currentUser = signal<User | null>(null);
  currentApplicant = signal<Applicant | null>(null);
  currentProfessional = signal<Professional | null>(null);

  sexOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private locationService: LocationService,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeData();
    this.loadCountries();
  }

  initializeData(): void {
    const user = this.authService.currentUser();
    const applicant = this.authService.currentApplicant();
    const professional = this.authService.currentProfessional();

    if (!user || !applicant) {
      this.dialogService.error('Error', 'No se pudo cargar la información del usuario')
        .subscribe(() => {
          this.router.navigate(['/profile']);
        });
      return;
    }

    this.currentUser.set(user);
    this.currentApplicant.set(applicant);
    this.currentProfessional.set(professional);

    this.initForm();
  }

  initForm(): void {
    const user = this.currentUser();
    const applicant = this.currentApplicant();

    this.profileForm = this.fb.group({
      name: [user?.name || '', [Validators.required, Validators.minLength(2)]],
      lastName: [user?.lastName || '', [Validators.required, Validators.minLength(2)]],
      phone: [user?.phone || '', Validators.required],
      countryId: [null, Validators.required],
      cityId: [{ value: applicant?.city?.id || null, disabled: true }, Validators.required],
      sex: [user?.sex || '', Validators.required],
      ci: [applicant?.ci || '']
    });

    if (applicant?.city?.country) {
      const countryId = applicant.city.country.id;
      this.profileForm.patchValue({ countryId });
      this.loadCitiesByCountry(countryId);
    }

    this.loading = false;
  }

  loadCountries(): void {
    this.locationService.getCountries(false).subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (err) => {
        console.error('Error al cargar países:', err);
        this.dialogService.error('Error', 'No se pudieron cargar los países');
      }
    });
  }

  onCountryChange(): void {
    const countryId = this.profileForm.get('countryId')?.value;

    this.profileForm.get('cityId')?.setValue(null);
    this.profileForm.get('cityId')?.disable();
    this.cities = [];

    if (countryId) {
      this.loadCitiesByCountry(countryId);
    }
  }

  loadCitiesByCountry(countryId: number): void {
    this.locationService.CitiesByCountry(countryId).subscribe({
      next: (cities) => {
        this.cities = cities;
        if (cities.length > 0) {
          this.profileForm.get('cityId')?.enable();
        } else {
          this.profileForm.get('cityId')?.disable();
        }
      },
      error: (err) => {
        console.error('Error al cargar ciudades:', err);
        this.profileForm.get('cityId')?.disable();
        this.dialogService.error('Error', 'No se pudieron cargar las ciudades');
      }
    });
  }

  onPhoneChange(phoneEvent: any): void {
    this.phoneData = phoneEvent;

    const phoneControl = this.profileForm.get('phone');
    if (phoneEvent.valid) {
      phoneControl?.setErrors(null);
    } else {
      phoneControl?.setErrors({ invalidPhone: true });
    }
  }

  onSubmit(): void {
    if (!this.phoneData || !this.phoneData.valid) {
      this.dialogService.warning(
        'Teléfono Inválido',
        'Por favor ingresa un número de teléfono válido'
      );
      return;
    }

    this.saving = true;

    const formData = this.profileForm.getRawValue();
    const updateData: UpdateApplicantDTO = {
      name: formData.name,
      lastName: formData.lastName,
      phone: this.phoneData.fullNumber,
      cityId: formData.cityId,
      sex: formData.sex || undefined,
      ci: formData.ci || undefined
    };


    const applicantId = this.currentApplicant()?.id;
    if (!applicantId) {
      this.saving = false;
      this.dialogService.error('Error', 'No se pudo identificar el usuario');
      return;
    }

    console.log('Datos a enviar para actualización:', updateData);
    console.log('Archivo seleccionado:', this.selectedFile);

    const updateObservable = this.selectedFile
      ? this.authService.updateApplicantWithFile(applicantId, updateData, this.selectedFile)
      : this.authService.updateApplicant(applicantId, updateData);

    console.log('Usando método:', this.selectedFile ? 'updateApplicantWithFile' : 'updateApplicant');

    updateObservable.subscribe({
      next: () => {
        this.saving = false;

        this.currentUser.set(this.authService.currentUser());
        this.currentApplicant.set(this.authService.currentApplicant());

        console.log('Perfil actualizado - Signals y localStorage sincronizados');

        this.dialogService.success(
          'Perfil Actualizado',
          'Tus cambios han sido guardados exitosamente'
        ).subscribe(() => {
          this.router.navigate(['/profile']);
        });
      },
      error: (err) => {
        this.saving = false;
        this.dialogService.error(
          'Error',
          err.error?.message || 'No se pudo actualizar el perfil'
        );
      }
    });
  }

  onCancel(): void {
    if (this.profileForm.dirty) {
      this.dialogService.confirm(
        'Cancelar Edición',
        '¿Estás seguro de que deseas descartar los cambios?',
        'Sí, descartar',
        'No, continuar editando'
      ).subscribe((result) => {
        if (result.confirmed) {
          this.router.navigate(['/profile']);
        }
      });
    } else {
      this.router.navigate(['/profile']);
    }
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return '??';
    return `${user.name.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  getAvatarUrl(): string | null {
    if (this.imagePreview) {
      return this.imagePreview;
    }
    const applicant = this.currentApplicant();
    if (applicant?.photoThumbnailUrl) {
      return applicant.photoThumbnailUrl;
    }
    const professional = this.currentProfessional();
    return professional?.avatarThumbnailUrl || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('onFileSelected llamado, input.files:', input.files);

    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log('Archivo seleccionado:', file.name, file.type, file.size);

      if (!file.type.startsWith('image/')) {
        this.dialogService.error('Error', 'Por favor selecciona una imagen válida');
        return;
      }

      if (file.size > 7 * 1024 * 1024) {
        this.dialogService.error('Error', 'La imagen no debe superar los 7 MB');
        return;
      }

      this.selectedFile = file;
      console.log('selectedFile asignado:', this.selectedFile);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        console.log('imagePreview asignado');
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }
}
