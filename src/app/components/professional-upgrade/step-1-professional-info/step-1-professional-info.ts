import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfessionalService } from '../../../services/professional.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-step-1-professional-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-1-professional-info.html',
  styleUrl: './step-1-professional-info.css'
})
export class Step1ProfessionalInfo implements OnInit {
  @Input() initialData: any;
  @Output() nextStep = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isLoading = false;

  user: any;
  constructor(
    private fb: FormBuilder,
    private professionalService: ProfessionalService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    if (this.storageService.isUserLoggedIn()) {
      this.user = this.storageService.getUser();
      this.form = this.fb.group({
        name: [this.user.name || '', Validators.required],
        lastName: [this.user.lastName || '', Validators.required],
        phone: [this.user.phone || '', Validators.required],
        birthDate: [this.user.birthDate || '', Validators.required],
      });
    }else {
       this.form = this.fb.group({
      name: [this.initialData?.name || '', Validators.required],
      lastName: [this.initialData?.lastName || '', Validators.required],
      phone: [this.initialData?.phone || '', Validators.required],
      birthDate: [this.initialData?.birthDate || '', Validators.required],
    });
    }

  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  onNext() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    // this.professionalService.upgradeToPhrofessional(this.form.value).subscribe(
    //   (response) => {
    //     this.isLoading = false;
    //     this.nextStep.emit({
    //       professional: response.data,
    //       formData: this.form.value
    //     });
    //   },
    //   (error) => {
    //     this.isLoading = false;
    //     alert('Error: ' + error.error.message);
    //   }
    // );
  }

  onCancel() {
    this.cancel.emit();
  }
}
