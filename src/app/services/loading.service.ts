// src/app/services/loading.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = signal<boolean>(false);
  loadingMessage = signal<string>('Cargando...');


  show(message: string = 'Cargando...'): void {
    this.loadingMessage.set(message);
    this.isLoading.set(true);
  }

  hide(): void {
    setTimeout(() => {
      this.isLoading.set(false);
    }, 300);
  }


  hideImmediate(): void {
    this.isLoading.set(false);
  }
}
