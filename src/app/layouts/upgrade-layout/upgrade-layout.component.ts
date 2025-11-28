import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { ProfessionalUpgradeStateService } from '../../services/professional-upgrade-state.service';

interface Step {
  number: number;
  label: string;
  route: string;
  completed: boolean;
  active: boolean;
}

@Component({
  selector: 'app-upgrade-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <!-- Fondo externo DARK -->
    <div class="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-8">

        <!-- Header - DARK THEME -->
        <div class="text-center backdrop-blur-sm bg-card-bg/50 rounded-2xl p-8 border border-border">
          <h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Conviértete en Profesional
          </h1>
          <p class="text-text-light mt-3 text-lg">
            Completa los siguientes pasos para activar tu cuenta profesional
          </p>
        </div>

        <!-- Stepper - DARK THEME -->
        <div class="bg-card-bg border border-border rounded-2xl p-8">
          <div class="flex items-center justify-between overflow-x-auto pb-4">
            <ng-container *ngFor="let step of steps; let last = last">
              <!-- Step Circle -->
              <div class="flex flex-col items-center flex-shrink-0 cursor-pointer"
                   (click)="navigateToStep(step)">
                <div
                  [class.bg-gradient-to-br]="step.completed || step.active"
                  [class.from-primary]="step.completed || step.active"
                  [class.to-primary-dark]="step.completed || step.active"
                  [class.text-background]="step.completed || step.active"
                  [class.bg-card-bg-light]="!step.completed && !step.active"
                  [class.border-2]="!step.completed && !step.active"
                  [class.border-border]="!step.completed && !step.active"
                  [class.text-text-light]="!step.completed && !step.active"
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors shadow-gold"
                >
                  <span *ngIf="!step.completed">{{ step.number }}</span>
                  <svg *ngIf="step.completed" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <p class="text-xs sm:text-sm font-medium mt-2 text-center whitespace-nowrap transition-colors"
                   [class.text-primary]="step.completed || step.active"
                   [class.text-text-light]="!step.completed && !step.active">
                  {{ step.label }}
                </p>
              </div>

              <!-- Connector Line -->
              <div
                *ngIf="!last"
                [class.bg-primary]="step.completed"
                [class.bg-border]="!step.completed"
                class="flex-1 h-1 mx-2 sm:mx-4 transition-colors"
              ></div>
            </ng-container>
          </div>
        </div>

        <!-- Content Area -->
        <div class="bg-card-bg border border-border rounded-lg shadow-gold p-8 md:p-12">
          <router-outlet></router-outlet>
        </div>

        <!-- Help Section -->
        <div class="bg-primary/10 border border-primary/30 rounded-lg p-6 flex items-start gap-3">
          <svg class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm text-text-light">
            <span class="font-semibold text-text">¿Necesitas ayuda?</span>
            Si tienes preguntas sobre algún paso, contacta a nuestro equipo de soporte en
            <a href="mailto:support@tebusco.com" class="text-primary hover:text-accent font-semibold transition">support@tebusco.com</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UpgradeLayoutComponent implements OnInit, OnDestroy {
  steps: Step[] = [
    { number: 1, label: 'Información', route: 'info', completed: false, active: false },
    { number: 2, label: 'Documentos', route: 'documents', completed: false, active: false },
    { number: 3, label: 'Plan', route: 'plan', completed: false, active: false },
    { number: 4, label: 'Confirmar', route: 'confirm', completed: false, active: false },
    { number: 5, label: 'Categorías', route: 'categories', completed: false, active: false },
    { number: 6, label: 'Configurar', route: 'configure', completed: false, active: false },
    { number: 7, label: 'Completado', route: 'complete', completed: false, active: false }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private stateService: ProfessionalUpgradeStateService
  ) {}

  ngOnInit() {
    // Actualizar estado de los pasos según el servicio
    this.updateStepsFromState();

    // Actualizar paso activo cuando cambia la ruta
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateActiveStep();
      });

    // Escuchar cambios en el estado
    this.stateService.getState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateStepsFromState();
      });

    // Actualizar paso activo inicial
    this.updateActiveStep();
  }

  private updateStepsFromState() {
    const state = this.stateService.getCurrentState();
    this.steps.forEach(step => {
      step.completed = state.completedSteps.includes(step.number);
    });
  }

  private updateActiveStep() {
    const url = this.router.url;
    this.steps.forEach(step => {
      step.active = url.includes(`/${step.route}`);
    });
  }

  navigateToStep(step: Step) {
    if (step.completed || this.stateService.canAccessStep(step.number)) {
      this.router.navigate([`/professional/${step.route}`]);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
