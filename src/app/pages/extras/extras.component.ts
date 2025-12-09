import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExtrasService, ExtraPackage } from '../../services/extras.service';
import { Router, ActivatedRoute } from '@angular/router'; // <--- Importamos ActivatedRoute

@Component({
  selector: 'app-extras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './extras.component.html',
  styleUrls: ['./extras.component.css']
})
export class ExtrasComponent implements OnInit {
  // Inyecciones
  private extrasService = inject(ExtrasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // <--- Inyectamos la ruta activa

  // Signals
  packages = signal<ExtraPackage[]>([]);
  loading = signal(true);
  error = signal('');
  selectedFeature = signal<string>('Todos');

  // Computado: Lista de Tabs disponibles
  availableFeatures = computed(() => {
    const features = new Set(this.packages().map(p => p.feature.displayName));
    // Ordenamos para que se vea bonito, 'Todos' siempre primero
    return ['Todos', ...Array.from(features).sort()];
  });

  // Computado: Filtro reactivo
  filteredPackages = computed(() => {
    if (this.selectedFeature() === 'Todos') {
      return this.packages();
    }
    return this.packages().filter(p => p.feature.displayName === this.selectedFeature());
  });

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.extrasService.getPackages().subscribe({
      next: (response) => {
        if (response.success) {
          this.packages.set(response.data);

          // ✨ MAGIA AQUÍ: Una vez cargados los datos, verificamos la URL
          this.checkUrlParams();

        } else {
          this.error.set(response.message);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los paquetes extra.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  // 👇 Nueva función para leer la URL
  private checkUrlParams(): void {
    // Leemos el parámetro 'tipo' o 'filter' de la URL (ej: /extras?tipo=categoria)
    const filterParam = this.route.snapshot.queryParamMap.get('tipo');

    if (filterParam) {
      const paramLower = filterParam.toLowerCase();

      // Buscamos en las características disponibles una que coincida parcialmente
      // Esto permite que ?tipo=cat encuentre "Categorías" o ?tipo=ofer encuentre "Ofertas"
      const foundFeature = this.availableFeatures().find(feature =>
        feature.toLowerCase().includes(paramLower) && feature !== 'Todos'
      );

      if (foundFeature) {
        this.selectedFeature.set(foundFeature);
      }
    }
  }

  selectTab(featureName: string): void {
    this.selectedFeature.set(featureName);

    // Opcional: Actualizar la URL sin recargar la página cuando el usuario hace clic manual
    // esto es bueno para UX, así pueden copiar el link y compartirlo
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tipo: featureName === 'Todos' ? null : featureName.toLowerCase() },
      queryParamsHandling: 'merge'
    });
  }

  buyPackage(pkg: ExtraPackage): void {
    this.router.navigate(['/extras/purchase', pkg.id]);
  }


}
