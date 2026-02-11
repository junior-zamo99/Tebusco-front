import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProfessionalService, UpgradeToProfessionalRequest } from '../../../services/professional.service';
import { StorageService } from '../../../services/storage.service';
import { DialogService } from '../../../services/dialog.service';
import { LocationService } from '../../../services/location.service';
import { City, Country } from '../../../models/location.model';

@Component({
  selector: 'app-professional-upgrade',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './professional-upgrade.html',
  styleUrl: './professional-upgrade.css'
})
export class ProfessionalUpgrade implements OnInit {
  form!: FormGroup;
  isLoading = false;
  errorMessage = '';
  user: any = null;

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

    this.form = this.fb.group({
      name: [
        this.user?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      ],
      lastName: [
        this.user?.lastName || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)]
      ],
      phone: [
        this.user?.phone || '',
        [Validators.required, Validators.pattern(/^\+?[0-9\s-]{8,15}$/)]
      ],
      birthDate: [
        formattedBirthDate,
        [Validators.required, this.ageValidator()]
      ],
      countryId: [null, Validators.required],
    cityId: [null, Validators.required]
    });
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

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

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
      birthDate: 'La fecha de nacimiento'
    };

    if (field.errors['required']) {
      return `${labels[fieldName] || 'Este campo'} es requerido`;
    }

    if (field.errors['minlength']) {
      return 'Debe tener al menos 2 caracteres';
    }

    if (field.errors['maxlength']) {
      return 'Máximo 50 caracteres';
    }

    if (field.errors['pattern']) {
      return 'Formato de teléfono inválido (ej: +591 71234567)';
    }

    if (field.errors['minAge']) {
      return 'Debes ser mayor de 18 años';
    }

    return 'Campo inválido';
  }


  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }


    this.isLoading = true;
    this.errorMessage = '';

    const requestData: UpgradeToProfessionalRequest = {
      name: this.form.value.name,
      lastName: this.form.value.lastName,
      phone: this.form.value.phone,
      birthDate: this.form.value.birthDate,
      cityId: this.form.value.cityId
    };

    this.professionalService.upgradeToProfessional(requestData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('✅ Upgrade iniciado:', response);

        const professionalId = response.data.id;
        localStorage.setItem('professionalId', professionalId.toString());

        this.dialogService.success(
          '¡Proceso Iniciado!',
          'Tu solicitud fue procesada correctamente. Ahora debes subir tus documentos.'
        ).subscribe(() => {
          this.router.navigate(['/professional/documents']);
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
            this.router.navigate(['/professional/documents']);
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
