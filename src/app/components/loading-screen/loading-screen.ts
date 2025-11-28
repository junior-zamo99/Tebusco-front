import { Component, AfterViewInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import lottie, { AnimationItem } from 'lottie-web';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-screen.html',
  styleUrl: './loading-screen.css',
})
export class LoadingScreen implements AfterViewInit, OnDestroy {
  private animation: AnimationItem | null = null;

  // Computed para reactividad
  isVisible = computed(() => this.loadingService.isLoading());
  message = computed(() => this.loadingService.loadingMessage());

  constructor(public loadingService: LoadingService) {}

  ngAfterViewInit(): void {
    // Ahora el contenedor siempre existe porque no usamos *ngIf
    this.loadAnimation();
  }

  loadAnimation(): void {
    const container = document.getElementById('lottie-container');

    if (!container) {
      console.error('❌ Contenedor lottie-container no encontrado');
      return;
    }

    try {
      this.animation = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/animations/loading.json',
      });

      this.animation.addEventListener('DOMLoaded', () => {
        console.log('✅ Animación Lottie cargada correctamente');
      });

      this.animation.addEventListener('data_failed', () => {
        console.error('❌ Error al cargar el JSON de la animación');
      });

    } catch (error) {
      console.error('❌ Error al inicializar Lottie:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.animation) {
      this.animation.destroy();
      this.animation = null;
    }
  }
}
