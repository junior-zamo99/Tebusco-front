import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExtrasSelectorComponent } from '../../../components/extras-selector/extras-selector.component';
import { ExtrasService, ExtraPackage, SelectedExtra } from '../../../services/extras.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-professional-extras',
  standalone: true,
  imports: [ExtrasSelectorComponent],
  templateUrl: './professional-extras.html',
  styleUrls: ['./professional-extras.css']
})
export class ProfessionalExtras implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() isVisible = false;
  @Output() extrasSelected = new EventEmitter<any[]>();
  @Output() back = new EventEmitter<void>();
  @Output() continue = new EventEmitter<void>();

  packages: ExtraPackage[] = [];
  selectedExtras: SelectedExtra[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private extrasService: ExtrasService,
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPackages();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPackages() {
    this.isLoading = true;
    this.errorMessage = '';

    this.extrasService.getPackages()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.packages = response.data || [];
          console.log('📦 Paquetes de extras cargados:', this.packages);
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al cargar los extras disponibles';
          console.error('❌ Error cargando extras:', error);
          this.cdr.detectChanges();
        }
      });
  }

  onExtrasChange(extras: SelectedExtra[]) {
    this.selectedExtras = extras;
    console.log('✅ Extras seleccionados actualizados:', this.selectedExtras);
    this.extrasSelected.emit(extras);
    this.cdr.detectChanges();
  }

  onBackClick() {
    console.log('⬅️ Volver a planes');
    this.back.emit();
  }

  onCancelClick() {
    this.dialogService.confirm(
      'Cancelar proceso',
      '¿Estás seguro de que deseas cancelar? Perderás el progreso actual.',
      'Sí, cancelar',
      'No, continuar'
    ).pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result.confirmed) {
        this.router.navigate(['/applicant/dashboard']);
      }
    });
  }

  onContinueClick() {
    console.log('➡️ Continuar al pago con extras:', this.selectedExtras);
    this.continue.emit();
  }

  get totalExtrasPrice(): number {
    return this.selectedExtras.reduce((total, extra) => total + extra.totalPrice, 0);
  }

  get selectedExtrasCount(): number {
    return this.selectedExtras.length;
  }

  get currency(): string {
    return this.packages.length > 0 ? this.packages[0].currency : 'BOB';
  }
}
