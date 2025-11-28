import { Component, signal, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';
import { RegisterRequest } from '../../interface/auth.interface';
import { BOLIVIA_DATA, COUNTRIES, Department, City } from '../../data/bolivia-locations';
import { MapLocationPickerComponent, LocationCoordinates } from '../../components/map-location-picker/map-location-picker';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [MapLocationPickerComponent, CommonModule, FormsModule]
})
export class RegisterComponent implements OnInit {
  @ViewChild(MapLocationPickerComponent) mapComponent!: MapLocationPickerComponent;

  currentStep = signal<number>(1);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  isLoadingLocation = signal<boolean>(false);

  locationMode = signal<'form' | 'map'>('form');

  countries = COUNTRIES;
  departments: Department[] = [];
  cities: City[] = [];

  formData = {
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    ci: '',
    phone: ''
  };

  addressData = {
    label: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',
    lat: null as number | null,
    lng: null as number | null
  };

  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private router: Router,
        private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.detectUserLocation();
  }

private async detectUserLocation(): Promise<void> {
  this.isLoadingLocation.set(true);

  try {
    const location = await this.locationService.getQuickLocation();


    this.addressData.lat = location.lat;
    this.addressData.lng = location.lng;
    this.addressData.country = location.country || 'Bolivia';

    if (this.locationMode() === 'map' && this.mapComponent) {
      setTimeout(() => {
        this.mapComponent.centerMap(location.lat, location.lng, 15);
      }, 500);
    }

    if (location.city && location.state) {

      const normalizedCity = this.normalizeString(location.city);
      const normalizedState = this.normalizeString(location.state);

      const department = BOLIVIA_DATA.departments.find((d) => {
        const deptName = this.normalizeString(d.name);
        return deptName.includes(normalizedState) || normalizedState.includes(deptName);
      });

      if (department) {

        this.departments = BOLIVIA_DATA.departments;
        this.addressData.state = department.name;
        this.cities = department.cities;

        const city = department.cities.find((c) => {
          const cityName = this.normalizeString(c.name);
          return cityName.includes(normalizedCity) || normalizedCity.includes(cityName);
        });

        if (city) {
          this.addressData.city = city.name;
          this.addressData.lat = city.lat;
          this.addressData.lng = city.lng;
        } else {
          this.addressData.city = location.city;
        }
      } else {
        this.addressData.state = location.state || '';
        this.addressData.city = location.city || '';
      }
    } else if (location.city && !location.state) {

      const normalizedCity = this.normalizeString(location.city);
      this.departments = BOLIVIA_DATA.departments;

      for (const dept of BOLIVIA_DATA.departments) {
        const city = dept.cities.find((c) => {
          const cityName = this.normalizeString(c.name);
          return cityName.includes(normalizedCity) || normalizedCity.includes(cityName);
        });

        if (city) {
          this.addressData.state = dept.name;
          this.addressData.city = city.name;
          this.addressData.lat = city.lat;
          this.addressData.lng = city.lng;
          this.cities = dept.cities;
          break;
        }
      }

      if (!this.addressData.city) {
        this.addressData.city = location.city;
      }
    }

  } catch (error) {
  } finally {
    this.isLoadingLocation.set(false);
  }
}


  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  nextStep(): void {
    if (this.validateStep1()) {
      this.currentStep.set(2);
      this.errorMessage.set('');
    }
  }

  prevStep(): void {
    this.currentStep.set(1);
    this.errorMessage.set('');
  }

  switchToFormMode(): void {
    this.locationMode.set('form');
  }

  switchToMapMode(): void {
    this.locationMode.set('map');
  }

  onCountryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const countryName = select.value;

    this.addressData.country = countryName;
    this.addressData.state = '';
    this.addressData.city = '';
    this.addressData.lat = null;
    this.addressData.lng = null;

    if (countryName === 'Bolivia') {
      this.departments = BOLIVIA_DATA.departments;
    } else {
      this.departments = [];
    }

    this.cities = [];
  }

  onDepartmentChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const departmentName = select.value;

    this.addressData.state = departmentName;
    this.addressData.city = '';
    this.addressData.lat = null;
    this.addressData.lng = null;

    const department = this.departments.find((d) => d.name === departmentName);
    if (department) {
      this.cities = department.cities;
    } else {
      this.cities = [];
    }
  }

  onCityChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const cityName = select.value;

    this.addressData.city = cityName;

    const city = this.cities.find((c) => c.name === cityName);
    if (city) {
      this.addressData.lat = city.lat;
      this.addressData.lng = city.lng;
    }
  }


onLocationSelected(location: LocationCoordinates): void {

  this.addressData.lat = location.lat;
  this.addressData.lng = location.lng;

  if (location.address) {
    if (location.address.country) {
      const normalizedCountry = this.normalizeString(location.address.country);
      if (normalizedCountry.includes('bolivia')) {
        this.addressData.country = 'Bolivia';
        this.departments = BOLIVIA_DATA.departments;
      } else {
        this.addressData.country = location.address.country;
      }
    }

    if (location.address.state && this.addressData.country === 'Bolivia') {
      const normalizedState = this.normalizeString(location.address.state);

      const department = BOLIVIA_DATA.departments.find((d) => {
        const deptName = this.normalizeString(d.name);
        return deptName.includes(normalizedState) || normalizedState.includes(deptName);
      });

      if (department) {
        this.addressData.state = department.name;
        this.cities = department.cities;
      } else {
        this.addressData.state = location.address.state;
      }
    }

    if (location.address.city) {
      const normalizedCity = this.normalizeString(location.address.city);

      const city = this.cities.find((c) => {
        const cityName = this.normalizeString(c.name);
        return cityName.includes(normalizedCity) || normalizedCity.includes(cityName);
      });

      if (city) {
        this.addressData.city = city.name;
      } else {
        this.addressData.city = location.address.city;
      }
    }

    if (location.address.postcode) {
      this.addressData.postalCode = location.address.postcode;
    }

    if (location.address.fullAddress) {
      this.addressData.address = location.address.fullAddress;
    }
  }
}

  private validateStep1(): boolean {
    if (!this.formData.name || this.formData.name.trim().length < 2) {
      this.errorMessage.set('El nombre debe tener al menos 2 caracteres');
      return false;
    }

    if (!this.formData.lastName || this.formData.lastName.trim().length < 2) {
      this.errorMessage.set('El apellido debe tener al menos 2 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.formData.email || !emailRegex.test(this.formData.email)) {
      this.errorMessage.set('Email inválido');
      return false;
    }

    if (!this.formData.password || this.formData.password.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return false;
    }

    if (!this.formData.ci || this.formData.ci.trim().length < 5) {
      this.errorMessage.set('CI inválido (mínimo 5 caracteres)');
      return false;
    }

    if (!this.formData.phone || this.formData.phone.trim().length < 7) {
      this.errorMessage.set('Teléfono inválido (mínimo 7 dígitos)');
      return false;
    }

    return true;
  }

  private validateStep2(): boolean {
    if (!this.addressData.label || this.addressData.label.trim().length < 2) {
      this.errorMessage.set('La etiqueta es requerida (ej: Casa, Trabajo)');
      return false;
    }

    if (!this.addressData.country) {
      this.errorMessage.set('El país es requerido');
      return false;
    }

    if (!this.addressData.city) {
      this.errorMessage.set('La ciudad es requerida');
      return false;
    }

    if (!this.addressData.address || this.addressData.address.trim().length < 5) {
      this.errorMessage.set('La dirección completa es requerida (mínimo 5 caracteres)');
      return false;
    }

    if (!this.addressData.lat || !this.addressData.lng) {
      this.errorMessage.set('Debes seleccionar una ubicación válida (formulario o mapa)');
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (!this.validateStep2()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const registerData: RegisterRequest = {
      name: this.formData.name.trim(),
      lastName: this.formData.lastName.trim(),
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
      ci: this.formData.ci.trim(),
      phone: this.formData.phone.trim(),
      userAddress: {
        label: this.addressData.label.trim(),
        country: this.addressData.country,
        city: this.addressData.city,
        address: this.addressData.address.trim(),
        lat: this.addressData.lat!,
        lng: this.addressData.lng!,
        postalCode: this.addressData.postalCode?.trim() || undefined,
        state: this.addressData.state || undefined
      }
    };


    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.storageService.clearAll();
       const user = { ...response.data.user, phone: response.data.user.phone || '' };
        this.storageService.saveUser(user);

        if (response.data.applicant) {
          this.storageService.saveApplicant(response.data.applicant);
        }

        if (response.data.professional) {
          this.storageService.saveProfessional(response.data.professional);
        }

        this.redirectBasedOnUserType(response.data);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Error al registrar usuario');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

    private redirectBasedOnUserType(data: any): void {
    const hasApplicant = !!data.applicant;
    const hasProfessional = !!data.professional;

    if (hasApplicant && hasProfessional) {

      this.storageService.saveTypeOfUser({ keyType: 2 });
      localStorage.setItem('current_view', 'applicant');
      console.log('🔄 Usuario dual detectado, iniciando como solicitante en /applicant/dashboard');
      this.router.navigate(['/applicant/dashboard']);
    } else if (hasApplicant && !hasProfessional) {
      this.storageService.saveTypeOfUser({ keyType: 1 });
      localStorage.setItem('current_view', 'applicant');
      console.log('🔄 Usuario solicitante detectado, redirigiendo a /applicant/dashboard');
      this.router.navigate(['/applicant/dashboard']);
    } else {
      console.log('⚠️ Usuario sin roles definidos, redirigiendo a home');
      this.router.navigate(['/']);
    }
  }
}
