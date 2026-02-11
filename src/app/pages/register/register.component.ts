import { Component, signal, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';
import { RegisterRequest } from '../../interface/auth.interface';

import { MapLocationPickerComponent, LocationCoordinates } from '../../components/map-location-picker/map-location-picker';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { City, Country } from '../../models/location.model';
import { PhoneInput } from '../../components/phone-input/phone-input';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ CommonModule, FormsModule, PhoneInput]
})
export class RegisterComponent implements OnInit {

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  countries: Country[] = [];
  cities: City[] = [];

  isPhoneValid: boolean = false;


  formData = {
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    ci: '',
    phone: '',
    sex: ''
  };

  selectedCountryId: number | null = null;
  selectedCityId: number | null = null;

  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private router: Router,
    private storageService: StorageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries() {
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
    this.cities = [];
    this.selectedCityId = null;
    if (this.selectedCountryId) {
      this.locationService.CitiesByCountry(this.selectedCountryId).subscribe({
        next: (data) => this.cities = data
      });
    }
  }

  onPhoneChange(event: any) {
    this.isPhoneValid = event.valid;
    if (event.valid) {
      this.formData.phone = event.fullNumber;
    } else {
      this.formData.phone = '';
    }
  }

  onSubmit(): void {
    if (!this.formData.name || !this.formData.lastName || !this.formData.email || !this.formData.password) {
      this.errorMessage.set('Por favor completa los campos obligatorios');
      return;
    }
    if (this.formData.password !== this.formData.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }
    if (!this.selectedCityId) {
      this.errorMessage.set('Debes seleccionar tu ciudad');
      return;
    }

    if (!this.isPhoneValid || !this.formData.phone) {
      this.errorMessage.set('Por favor ingresa un número de teléfono válido');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const registerData: RegisterRequest = {
      name: this.formData.name.trim(),
      lastName: this.formData.lastName.trim(),
      email: this.formData.email.trim().toLowerCase(),
      password: this.formData.password,
     //ci: this.formData.ci.trim(),
      phone: this.formData.phone,
      sex: this.formData.sex as any,
      cityid: this.selectedCityId
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.storageService.clearAll();

        if (response.data.user) {
             const userToSave = { ...response.data.user, phone: response.data.user.phone || '' };
             this.storageService.saveUser(userToSave);
        }
        if (response.data.applicant) {
            const applicantToSave = { ...response.data.applicant, city: response.data.applicant.city || undefined };
            this.storageService.saveApplicant(applicantToSave);
        }

        this.storageService.saveTypeOfUser({ keyType: 1 });
        localStorage.setItem('current_view', 'sa');
        this.router.navigate(['/applicant/dashboard']);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set(error.error?.message || 'Error al registrar usuario');
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false)
    });
  }


  onLoginRedirect(): void {
    this.router.navigate(['/login']);
  }
}
