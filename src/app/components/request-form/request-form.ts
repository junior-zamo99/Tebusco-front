import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryNode } from '../../models/category.model';
import { RequestUrgencyEnum } from '../../models/request.models'; // Ajusta ruta
import { LocationService } from '../../services/location.service';
import { LocationCoordinates, MapLocationPickerComponent } from '../map-location-picker/map-location-picker';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapLocationPickerComponent],
  templateUrl: './request-form.html',
})
export class RequestForm implements OnInit {

  @Input() selectedCategories: CategoryNode[] = [];
  @Input() isSubmitting = false;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  form: FormGroup;
  initialLat = -16.5000;
  initialLng = -68.1500;

  // DEFINICIÓN DE URGENCIAS (Español + Estilos)
  urgencyLevels = [
    {
      value: RequestUrgencyEnum.LOW,
      label: 'Baja',
      desc: 'Puede esperar unos días',
      classes: 'border-green-200 text-green-700 hover:bg-green-50',
      activeClasses: 'bg-green-100 border-green-500 text-green-800 ring-1 ring-green-500'
    },
    {
      value: RequestUrgencyEnum.MEDIUM,
      label: 'Media',
      desc: 'Lo necesito pronto',
      classes: 'border-blue-200 text-blue-700 hover:bg-blue-50',
      activeClasses: 'bg-blue-100 border-blue-500 text-blue-800 ring-1 ring-blue-500'
    },
    {
      value: RequestUrgencyEnum.HIGH,
      label: 'Alta',
      desc: 'Para hoy o mañana',
      classes: 'border-orange-200 text-orange-700 hover:bg-orange-50',
      activeClasses: 'bg-orange-100 border-orange-500 text-orange-800 ring-1 ring-orange-500'
    },
    {
      value: RequestUrgencyEnum.URGENT,
      label: 'Urgente',
      desc: 'Emergencia inmediata',
      classes: 'border-red-200 text-red-700 hover:bg-red-50',
      activeClasses: 'bg-red-100 border-red-500 text-red-800 ring-1 ring-red-500'
    },
    {
      value: RequestUrgencyEnum.EMERGENCY,
      label: 'Emergencia',
      desc: 'Atención inmediata requerida',
      classes: 'border-purple-200 text-purple-700 hover:bg-purple-50',
      activeClasses: 'bg-purple-100 border-purple-500 text-purple-800 ring-1 ring-purple-500'
    }
  ];

  constructor(private fb: FormBuilder, private locationService: LocationService) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      urgency: [RequestUrgencyEnum.MEDIUM, [Validators.required]],
      budget: [null, [Validators.min(0)]],
      dateNeeded: [null],
      hourPreferred: [''],
      address: ['', [Validators.required]],
      lat: [null, [Validators.required]],
      lng: [null, [Validators.required]]
    });
  }

  async ngOnInit() {
    try {
      const coords = await this.locationService.getCoordinates();
      this.initialLat = coords.lat;
      this.initialLng = coords.lng;
    } catch (e) { console.warn(e); }
  }

  setUrgency(value: RequestUrgencyEnum) {
    this.form.get('urgency')?.setValue(value);
  }

  onMapLocationSelected(location: LocationCoordinates) {
    const addressString = location.address?.fullAddress || `${location.address?.city || ''}`;
    this.form.patchValue({
      lat: location.lat,
      lng: location.lng,
      address: addressString.trim() || this.form.get('address')?.value
    });
    this.form.get('address')?.markAsTouched();
    this.form.get('lat')?.markAsTouched();
  }

  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
