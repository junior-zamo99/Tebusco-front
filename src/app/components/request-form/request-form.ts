import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryNode } from '../../models/category.model';
import { RequestUrgencyEnum } from '../../models/request.models';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './request-form.html',
})
export class RequestForm implements OnInit, OnChanges {

  @Input() selectedCategories: CategoryNode[] = [];
  @Input() isSubmitting = false;
  @Input() initialData: any = null;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();
  @Output() changeCategory = new EventEmitter<void>();

  form: FormGroup;
  applicantCityName: string = 'Cargando...';

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

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      urgency: [RequestUrgencyEnum.MEDIUM, [Validators.required]],
      budget: [null, [Validators.min(0)]],
      dateNeeded: [null],
      hourPreferred: [''],
      cityId: [null, [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit() {

    if (this.initialData) {
      this.patchFormValues();
    } else {
      this.loadApplicantData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.initialData) {
      this.patchFormValues();
    }
  }

  loadApplicantData() {
    const applicant = this.storageService.getApplicant();

    if (applicant && applicant.city) {
      this.applicantCityName = applicant.city.name;
      this.form.patchValue({
        cityId: applicant.city.id
      });
    } else {
      this.applicantCityName = 'Ciudad no configurada';
    }
  }

  private patchFormValues(): void {
    if (!this.form || !this.initialData) return;

    if (this.initialData.city) {
      this.applicantCityName = this.initialData.city.name;
    } else {
      this.loadApplicantData();
    }


    let formattedDate = null;
    if (this.initialData.dateNeeded) {
      try {
        const dateObj = new Date(this.initialData.dateNeeded);
        if (!isNaN(dateObj.getTime())) {
             formattedDate = dateObj.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Error parseando fecha', e);
      }
    }

    this.form.patchValue({
      title: this.initialData.title,
      description: this.initialData.description,
      urgency: this.initialData.urgency,
      budget: this.initialData.budget,
      address: this.initialData.address,
      dateNeeded: formattedDate,
      hourPreferred: this.initialData.hourPreferred,
      cityId: this.initialData.cityId,
    });
  }

  setUrgency(value: RequestUrgencyEnum) {
    this.form.get('urgency')?.setValue(value);
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
