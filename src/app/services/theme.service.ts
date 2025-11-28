import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal para el tema actual
  currentTheme = signal<Theme>('dark');

  constructor() {
    // Cargar tema guardado o usar preferencia del sistema
    const savedTheme = this.loadThemeFromStorage();
    this.currentTheme.set(savedTheme);

    // Effect para aplicar cambios de tema al DOM
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  /**
   * Carga el tema desde localStorage o usa la preferencia del sistema
   */
  private loadThemeFromStorage(): Theme {
    const savedTheme = localStorage.getItem('theme') as Theme;

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    // Si no hay tema guardado, detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'dark'; // Por defecto tema oscuro
  }

  /**
   * Aplica el tema al documento HTML
   */
  private applyTheme(theme: Theme): void {
    const html = document.documentElement;

    // Remover ambas clases
    html.classList.remove('light', 'dark');

    // Agregar la clase del tema actual
    html.classList.add(theme);

    // Guardar en localStorage
    localStorage.setItem('theme', theme);
  }

  /**
   * Alterna entre tema claro y oscuro
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.currentTheme.set(newTheme);
  }

  /**
   * Establece un tema específico
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  /**
   * Obtiene el tema actual
   */
  getTheme(): Theme {
    return this.currentTheme();
  }

  /**
   * Verifica si el tema actual es oscuro
   */
  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  /**
   * Verifica si el tema actual es claro
   */
  isLight(): boolean {
    return this.currentTheme() === 'light';
  }
}
