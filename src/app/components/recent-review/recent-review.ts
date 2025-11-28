import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recent-review',
  imports: [CommonModule],
  templateUrl: './recent-review.html',
  styleUrl: './recent-review.css',
})
export class RecentReview {
    reviews = [
    {
      id: 1,
      clientInitials: 'AT',
      clientName: 'Ana Torres',
      time: 'Hace 2 días',
      rating: 5,
      comment: 'Excelente trabajo, muy profesional y puntual. Resolvió el problema rápidamente.',
      service: 'Reparación de PC',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 2,
      clientInitials: 'PQ',
      clientName: 'Pedro Quiroga',
      time: 'Hace 5 días',
      rating: 5,
      comment: 'Buen servicio. Llegó a tiempo y solucionó correctamente el problema.',
      service: 'Instalación de red',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 3,
      clientInitials: 'LS',
      clientName: 'Laura Sánchez',
      time: 'Hace 1 semana',
      rating: 4,
      comment: 'Trabajo satisfactorio, aunque tardó un poco más de lo esperado.',
      service: 'Mantenimiento',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}
