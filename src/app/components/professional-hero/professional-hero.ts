import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-professional-hero',
  imports: [CommonModule, RouterLink],
  templateUrl: './professional-hero.html',
  styleUrl: './professional-hero.css',
})
export class ProfessionalHero {
stats = [
    {
      icon: 'briefcase',
      value: '150+',
      label: 'Solicitudes Activas'
    },
    {
      icon: 'users',
      value: '2,500+',
      label: 'Clientes Potenciales'
    },
    {
      icon: 'star',
      value: '4.8',
      label: 'Calificación Promedio'
    }
  ];
}
