import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Ad {
  image: string;
  alt: string;
  title?: string;
}

@Component({
  selector: 'app-ads-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ads-carousel.html',
})
export class AdsCarousel implements OnInit, OnDestroy {

  ads: Ad[] = [
    { image: 'assets/publicidad/publicidad1.jpg', alt: 'Promo 1', title: 'Descuento Especial' },
    { image: 'assets/publicidad/publicidad2.jpg', alt: 'Promo 2', title: 'Servicios de Hogar' },
    { image: 'assets/publicidad/publicidad3.png', alt: 'Promo 3', title: 'Oferta Limitada' },
    { image: 'assets/publicidad/publicidad4.jpg', alt: 'Promo 4', title: 'Nuevos Profesionales' },
    { image: 'assets/publicidad/publicidad6.jpg', alt: 'Promo 5', title: 'Reparaciones Express' },
    { image: 'assets/publicidad/publicidad7.jpeg', alt: 'Promo 6', title: 'Limpieza Profunda' },
    { image: 'assets/publicidad/publicidad8.jpg', alt: 'Promo 7', title: 'Más Vendidos' },
  ];

  currentIndex = 0;
  itemsPerView = 3; // Mostrar 3 por defecto en escritorio
  intervalId: any;

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    // Cambia cada 4 segundos
    this.intervalId = setInterval(() => {
      this.next();
    }, 4000);
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  next() {
    // Si llegamos al final (donde ya no quedan 3 items para mostrar), volvemos al 0
    if (this.currentIndex >= this.ads.length - this.itemsPerView) {
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }
  }

  prev() {
    if (this.currentIndex === 0) {
      // Ir al final posible
      this.currentIndex = this.ads.length - this.itemsPerView;
    } else {
      this.currentIndex--;
    }
  }

  // Calcula el porcentaje de desplazamiento CSS
  getTransform() {
    // En móvil (1 item) se mueve 100% por index
    // En escritorio (3 items) se mueve 33.33% por index
    // NOTA: Para simplificar la demo, asumiremos la vista de escritorio para el cálculo en TS
    // o usaremos una variable CSS. Aquí uso la lógica para 3 items (33.33%).
    // Si estás en móvil, el CSS media query debería ajustar esto, pero para este ejemplo simple:
    return `translateX(-${this.currentIndex * (100 / this.itemsPerView)}%)`;
  }
}
