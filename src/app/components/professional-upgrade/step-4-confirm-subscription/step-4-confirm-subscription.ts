import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionService } from '../../../services/subscription.service';
import { Plan } from '../../../models/plan.model';
import { Subscription } from '../../../models/subscription.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step-4-confirm-subscription',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './step-4-confirm-subscription.html',
  styleUrl: './step-4-confirm-subscription.css'
})
export class Step4ConfirmSubscription implements OnInit {
  @Input() professionalData: any;
  @Input() selectedPlan: Plan | null = null;
  @Output() nextStep = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  isLoading = false;
  agreeTerms = false;
  subscription: Subscription | null = null;
  error: string | null = null;

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit() {
    this.calculateSubscriptionDates();
  }

  private calculateSubscriptionDates() {
    if (!this.selectedPlan) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + this.selectedPlan.days);

    this.subscription = {
      id: 0,
      planId: this.selectedPlan.id,
      planCode: this.selectedPlan.code,
      planName: this.selectedPlan.name,
      price: this.selectedPlan.price,
      days: this.selectedPlan.days,
      start: startDate,
      end: endDate,
      status: 'active',
      features: this.selectedPlan.features
    };
  }

  get totalPrice(): number {
    return this.selectedPlan?.price || 0;
  }

  get subscriptionStartDate(): string {
    return this.subscription?.start ? new Date(this.subscription.start).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';
  }

  get subscriptionEndDate(): string {
    return this.subscription?.end ? new Date(this.subscription.end).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';
  }

  onConfirm() {
    if (!this.agreeTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    if (!this.selectedPlan) {
      this.error = 'Plan no seleccionado';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.subscriptionService.createSubscription(
      this.selectedPlan.id,
      this.professionalData.id
    ).subscribe(
      (response) => {
        this.isLoading = false;
        this.nextStep.emit({ subscription: response.data });
      },
      (error) => {
        this.isLoading = false;
        this.error = error.error?.message || 'Error al crear la suscripción';
        alert(this.error);
      }
    );
  }

  onBack() {
    this.back.emit();
  }
}
