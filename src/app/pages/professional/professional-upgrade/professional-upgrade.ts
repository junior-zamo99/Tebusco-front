import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProfessionalService, UpgradeToProfessionalRequest } from '../../../services/professional.service';
import { StorageService } from '../../../services/storage.service';
import { DialogService } from '../../../services/dialog.service';
import { LocationService } from '../../../services/location.service';
import { City, Country } from '../../../models/location.model';
import { PhoneInput } from '../../../components/phone-input/phone-input';

@Component({
  selector: 'app-professional-upgrade',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, PhoneInput],
  templateUrl: './professional-upgrade.html',
  styleUrl: './professional-upgrade.css'
})
export class ProfessionalUpgrade implements OnInit {
  form!: FormGroup;
  isLoading = false;
  errorMessage = '';
  user: any = null;
  avatarFile: File | null = null;
  avatarPreview: string | null = null;

  countries: Country[] = [];
  cities: City[] = [];
  selectedCountryId: number | null = null;
  selectedCityId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private professionalService: ProfessionalService,
    private storageService: StorageService,
    private dialogService: DialogService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.initializeForm();
    this.loadCountries();
  }

  private loadUserData() {
    if (this.storageService.isUserLoggedIn()) {
      this.user = this.storageService.getUser();
    } else {
      this.dialogService.warning(
        'Sesión Requerida',
        'Debes iniciar sesión para continuar'
      ).subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  private initializeForm() {
    let formattedBirthDate = this.user?.birthDate || '';
    if (formattedBirthDate && formattedBirthDate.includes('T')) {
      formattedBirthDate = formattedBirthDate.split('T')[0];
    }
    const initialIsAdult = formattedBirthDate ? this.isOver18(formattedBirthDate) : false;

    this.form = this.fb.group({
      name: [
        this.user?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      ],
      lastName: [
        this.user?.lastName || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      ],
      phone: [this.user?.phone || '', Validators.required],
      birthDate: [formattedBirthDate, [this.ageValidator()]],
      isAdult: [initialIsAdult],
      countryId: [null, Validators.required],
      cityId: [null, Validators.required],
      whatsappNumber: [''],
      websiteUrl: [''],
      facebookProfile: [''],
      instagramProfile: [''],
      linkedinProfile: [''],
      youtubeChannel: [''],
      businessEmail: ['', [Validators.email]],
      bio: ['', [Validators.maxLength(500)]],
      totalExperience: [null]
    });

    // Auto-marcar "soy mayor de edad" cuando la fecha es válida y tiene 18+
    this.form.get('birthDate')!.valueChanges.subscribe(value => {
      if (value && this.isOver18(value)) {
        this.form.patchValue({ isAdult: true }, { emitEvent: false });
        this.form.get('isAdult')!.setErrors(null);
      } else if (value && !this.isOver18(value)) {
        this.form.patchValue({ isAdult: false }, { emitEvent: false });
      }
    });
  }

  private isOver18(dateStr: string): boolean {
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 18;
  }

  private loadCountries() {
    this.locationService.getCountries().subscribe({
      next: (data) => {
        this.countries = data;
        const bolivia = this.countries.find(c => c.code === 'BO' || c.name === 'Bolivia');
        if (bolivia) {
          this.selectedCountryId = bolivia.id;
          this.onCountryChange();
        }
      },
      error: (err) => console.error(err)
    });
  }

  onCountryChange() {
    const countryId = this.form.get('countryId')?.value;
    this.cities = [];
    this.form.patchValue({ cityId: null });

    if (countryId) {
      this.locationService.CitiesByCountry(countryId).subscribe({
        next: (data) => this.cities = data
      });
    }
  }

  private ageValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      return age < 18 ? { minAge: true } : null;
    };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const labels: any = {
      name: 'El nombre',
      lastName: 'El apellido',
      phone: 'El teléfono',
      countryId: 'El país',
      cityId: 'La ciudad'
    };

    if (field.errors['required']) {
      return `${labels[fieldName] || 'Este campo'} es requerido`;
    }
    if (field.errors['minlength']) return 'Debe tener al menos 2 caracteres';
    if (field.errors['maxlength']) return 'Máximo 50 caracteres';
    if (field.errors['invalidPhone']) return 'Número de teléfono inválido';
    if (field.errors['minAge']) return 'Debes ser mayor de 18 años';
    if (field.errors['ageRequired']) return 'Debes confirmar que eres mayor de edad';

    return 'Campo inválido';
  }

  onPhoneChange(data: any) {
    const ctrl = this.form.get('phone')!;
    if (data.valid) {
      ctrl.setValue(data.fullNumber);
      ctrl.setErrors(null);
    } else {
      ctrl.setValue('');
      ctrl.setErrors({ invalidPhone: true });
    }
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.dialogService.error('Archivo inválido', 'Solo se permiten imágenes.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      this.dialogService.error('Archivo muy grande', 'La imagen no puede superar los 8 MB.');
      return;
    }
    this.avatarFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.avatarPreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    // Siempre marcar todo como tocado para mostrar errores
    this.form.markAllAsTouched();

    // Validar confirmación de edad
    const v = this.form.value;
    const hasBirthDateValid = v.birthDate && this.isOver18(v.birthDate);
    if (!hasBirthDateValid && !v.isAdult) {
      this.form.get('isAdult')!.setErrors({ ageRequired: true });
      this.form.get('isAdult')!.markAsTouched();
    }

    // Verificar campos requeridos y errores generales
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const requestData: UpgradeToProfessionalRequest = {
      name: v.name,
      lastName: v.lastName,
      phone: v.phone,
      birthDate: v.birthDate,
      cityId: v.cityId,
      ...(v.whatsappNumber && { whatsappNumber: v.whatsappNumber }),
      ...(v.websiteUrl && { websiteUrl: v.websiteUrl }),
      ...(v.facebookProfile && { facebookProfile: v.facebookProfile }),
      ...(v.instagramProfile && { instagramProfile: v.instagramProfile }),
      ...(v.linkedinProfile && { linkedinProfile: v.linkedinProfile }),
      ...(v.youtubeChannel && { youtubeChannel: v.youtubeChannel }),
      ...(v.businessEmail && { businessEmail: v.businessEmail }),
      ...(v.bio && { bio: v.bio }),
      ...(v.totalExperience != null && { totalExperience: v.totalExperience })
    };

    this.professionalService.upgradeToProfessional(requestData, this.avatarFile || undefined).subscribe({
      next: (response) => {
        this.isLoading = false;

        const professionalId = response.data.id;
        localStorage.setItem('professionalId', professionalId.toString());

        this.dialogService.success(
          '¡Proceso Iniciado!',
          'Tu solicitud fue procesada correctamente. Ahora configura tus categorías.'
        ).subscribe(() => {
          this.router.navigate(['/professional/categories']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Error en upgrade:', error);

        if (error.error?.error === 'ALREADY_PROFESSIONAL') {
          this.dialogService.info(
            'Ya eres Profesional',
            'Ya tienes una cuenta profesional activa. Te redirigiremos a tu perfil.'
          ).subscribe(() => {
            this.router.navigate(['/professional/dashboard']);
          });
        } else if (error.error?.error === 'INVALID_USER_DATA') {
          this.errorMessage = 'Datos de usuario incompletos. Por favor verifica tu perfil.';
          this.dialogService.error('Datos Incompletos', this.errorMessage);
        } else if (error.error?.error === 'USER_NOT_FOUND') {
          this.dialogService.error(
            'Usuario no Encontrado',
            'No pudimos encontrar tu cuenta. Por favor inicia sesión nuevamente.'
          ).subscribe(() => {
            this.router.navigate(['/login']);
          });
        } else {
          this.errorMessage = error.error?.message || 'Error al iniciar el proceso de upgrade.';
          this.dialogService.error('Error en el Proceso', this.errorMessage);
        }
      }
    });
  }

  onCancel() {
    this.dialogService.confirm(
      '¿Cancelar Proceso?',
      'Podrás continuar con el registro más tarde. ¿Estás seguro de salir?',
      'Sí, salir',
      'Continuar aquí'
    ).subscribe((result) => {
      if (result.confirmed) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onReset() {
    this.initializeForm();
    this.errorMessage = '';
  }
}
