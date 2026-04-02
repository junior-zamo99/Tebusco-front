import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-professional',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero-professional.html',
  styleUrl: './hero-professional.css',
})
export class HeroProfessional {
  benefits = [
    {
      icon: 'users',
      title: 'Miles de Clientes',
      description: 'Acceso a oportunidades diarias'
    },
    {
      icon: 'trending-up',
      title: 'Crece tu Negocio',
      description: 'Aumenta tus ingresos garantizado'
    },
    {
      icon: 'shield-check',
      title: '100% Seguro',
      description: 'Pagos verificados y protegidos'
    }
  ];

  stats = [
    { value: '98%', label: 'Satisfacción' },
    { value: '24/7', label: 'Soporte' },
    { value:  '0%', label: 'Setup' }
  ];
}
