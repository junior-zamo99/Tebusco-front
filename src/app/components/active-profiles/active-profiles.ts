import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-active-profiles',
  imports: [CommonModule],
  templateUrl: './active-profiles.html',
  styleUrl: './active-profiles.css',
})
export class ActiveProfiles {
   profiles = [
    {
      id: 1,
      initials: 'DE',
      name: 'Desarrollador',
      isActive: true,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 2,
      initials: 'PL',
      name: 'Plomero',
      isActive: false,
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 3,
      initials: 'CA',
      name: 'Carpintero',
      isActive: false,
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 4,
      initials: 'EL',
      name: 'Electricista',
      isActive: false,
      color: 'from-gray-600 to-gray-700'
    },
    {
      id: 5,
      initials: 'ME',
      name: 'Mecánico',
      isActive: false,
      color: 'from-gray-600 to-gray-700'
    }
  ];
}
