import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending-offers',
  imports: [CommonModule],
  templateUrl: './pending-offers.html',
  styleUrl: './pending-offers.css',
})
export class PendingOffers {
    offers = [
    {
      id: 1,
      clientInitials: 'CR',
      clientName: 'Carlos Ruiz',
      distance: '2.3 km',
      time: 'Hace 15 min',
      title: 'Reparación de aire acondicionado',
      description: 'El aire acondicionado no enfría correctamente',
      price: 150,
      isUrgent: true,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 2,
      clientInitials: 'MG',
      clientName: 'María González',
      distance: '5.1 km',
      time: 'Hace 2 horas',
      title: 'Instalación de ducha eléctrica',
      description: 'Necesito instalar una ducha eléctrica nueva',
      price: 200,
      isUrgent: false,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 3,
      clientInitials: 'JP',
      clientName: 'Juan Pérez',
      distance: '1.8 km',
      time: 'Hace 4 horas',
      title: 'Reparación de tubería',
      description: 'Hay una fuga de agua en la cocina',
      price: 120,
      isUrgent: false,
      color: 'from-purple-500 to-purple-600'
    }
  ];
}
