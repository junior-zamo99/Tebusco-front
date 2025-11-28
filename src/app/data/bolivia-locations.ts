

export interface City {
  name: string;
  lat: number;
  lng: number;
}

export interface Department {
  name: string;
  cities: City[];
}

export interface Country {
  name: string;
  departments: Department[];
}

export const BOLIVIA_DATA: Country = {
  name: 'Bolivia',
  departments: [
    {
      name: 'La Paz',
      cities: [
        { name: 'La Paz', lat: -16.5000, lng: -68.1500 },
        { name: 'El Alto', lat: -16.5050, lng: -68.1620 },
        { name: 'Viacha', lat: -16.6542, lng: -68.2958 },
        { name: 'Achocalla', lat: -16.5667, lng: -68.1833 },
        { name: 'Copacabana', lat: -16.1667, lng: -69.0833 },
        { name: 'Achacachi', lat: -16.0500, lng: -68.6833 },
        { name: 'Sorata', lat: -15.7667, lng: -68.6500 },
        { name: 'Guanay', lat: -15.5000, lng: -67.9000 },
        { name: 'Caranavi', lat: -15.8333, lng: -67.5667 },
        { name: 'Coroico', lat: -16.1833, lng: -67.7167 },
        { name: 'Tiquina', lat: -16.2167, lng: -68.8167 },
        { name: 'Desaguadero', lat: -16.5667, lng: -69.0333 },
        { name: 'Puerto Acosta', lat: -15.5333, lng: -69.2667 },
        { name: 'Escoma', lat: -15.6167, lng: -69.0833 },
        { name: 'Tiahuanaco', lat: -16.5500, lng: -68.6833 },
        { name: 'Pucarani', lat: -16.3833, lng: -68.6167 },
        { name: 'Laja', lat: -16.5333, lng: -68.2833 },
        { name: 'Batallas', lat: -16.4167, lng: -68.5000 },
        { name: 'Puerto Pérez', lat: -16.2500, lng: -68.6833 },
        { name: 'Mecapaca', lat: -16.6667, lng: -68.0167 }
      ]
    },
    {
      name: 'Santa Cruz',
      cities: [
        { name: 'Santa Cruz de la Sierra', lat: -17.7833, lng: -63.1821 },
        { name: 'Montero', lat: -17.3394, lng: -63.2506 },
        { name: 'Warnes', lat: -17.5167, lng: -63.1667 },
        { name: 'La Guardia', lat: -17.9000, lng: -63.3333 },
        { name: 'Cotoca', lat: -17.7500, lng: -63.0500 },
        { name: 'Camiri', lat: -20.0500, lng: -63.5167 },
        { name: 'Puerto Suárez', lat: -18.9500, lng: -57.8000 },
        { name: 'San Ignacio de Velasco', lat: -16.3667, lng: -60.9667 },
        { name: 'Ascensión de Guarayos', lat: -15.8333, lng: -63.1667 },
        { name: 'Portachuelo', lat: -17.3500, lng: -63.4000 },
        { name: 'Mineros', lat: -17.4000, lng: -63.2000 },
        { name: 'Samaipata', lat: -18.1833, lng: -63.8667 },
        { name: 'Vallegrande', lat: -18.4833, lng: -64.1000 },
        { name: 'Comarapa', lat: -17.9167, lng: -64.5167 },
        { name: 'San José de Chiquitos', lat: -17.8667, lng: -60.7500 },
        { name: 'Puerto Quijarro', lat: -17.7833, lng: -57.7667 },
        { name: 'Roboré', lat: -18.3333, lng: -59.7500 },
        { name: 'San Matías', lat: -16.3667, lng: -58.4000 },
        { name: 'Concepción', lat: -16.1333, lng: -62.0333 },
        { name: 'San Javier', lat: -16.2667, lng: -62.5000 },
        { name: 'San Ramón', lat: -16.2667, lng: -62.7333 },
        { name: 'Buena Vista', lat: -17.4500, lng: -63.6667 },
        { name: 'San Carlos', lat: -17.3667, lng: -63.7167 },
        { name: 'Yapacaní', lat: -17.4000, lng: -63.8333 },
        { name: 'Santa Rosa del Sara', lat: -17.1167, lng: -63.5833 }
      ]
    },
    {
      name: 'Cochabamba',
      cities: [
        { name: 'Cochabamba', lat: -17.3895, lng: -66.1568 },
        { name: 'Quillacollo', lat: -17.3928, lng: -66.2789 },
        { name: 'Sacaba', lat: -17.3978, lng: -66.0386 },
        { name: 'Colcapirhua', lat: -17.3944, lng: -66.2028 },
        { name: 'Tiquipaya', lat: -17.3347, lng: -66.2156 },
        { name: 'Vinto', lat: -17.3956, lng: -66.3169 },
        { name: 'Sipe Sipe', lat: -17.4333, lng: -66.4000 },
        { name: 'Punata', lat: -17.5500, lng: -65.8333 },
        { name: 'Cliza', lat: -17.5833, lng: -65.9333 },
        { name: 'Arani', lat: -17.5667, lng: -65.7667 },
        { name: 'Tarata', lat: -17.6167, lng: -66.0167 },
        { name: 'Capinota', lat: -17.7167, lng: -66.2667 },
        { name: 'Arbieto', lat: -17.6167, lng: -66.0667 },
        { name: 'Villa Tunari', lat: -16.9667, lng: -65.4167 },
        { name: 'Shinahota', lat: -16.9833, lng: -65.3500 },
        { name: 'Puerto Villarroel', lat: -16.7500, lng: -64.8167 },
        { name: 'Entre Ríos', lat: -17.9667, lng: -64.1667 },
        { name: 'Mizque', lat: -17.9667, lng: -65.3500 },
        { name: 'Aiquile', lat: -18.2000, lng: -65.1833 },
        { name: 'Totora', lat: -17.7333, lng: -65.2000 },
        { name: 'Pocona', lat: -17.7167, lng: -65.4333 },
        { name: 'Tiraque', lat: -17.4333, lng: -65.7167 },
        { name: 'Chimoré', lat: -16.9833, lng: -65.1333 },
        { name: 'Independencia', lat: -17.1000, lng: -67.0500 }
      ]
    },
    {
      name: 'Oruro',
      cities: [
        { name: 'Oruro', lat: -17.9833, lng: -67.1167 },
        { name: 'Challapata', lat: -18.9000, lng: -66.7667 },
        { name: 'Huanuni', lat: -18.2833, lng: -66.8333 },
        { name: 'Machacamarca', lat: -18.0833, lng: -66.9667 },
        { name: 'Caracollo', lat: -17.6667, lng: -67.2167 },
        { name: 'El Choro', lat: -17.8500, lng: -67.0833 },
        { name: 'Poopó', lat: -18.3667, lng: -66.9833 },
        { name: 'Pazña', lat: -18.6000, lng: -66.9333 },
        { name: 'Toledo', lat: -17.3667, lng: -67.1833 },
        { name: 'Corque', lat: -18.2000, lng: -68.4000 },
        { name: 'Chipaya', lat: -18.6000, lng: -68.6500 },
        { name: 'Salinas de Garci Mendoza', lat: -19.6500, lng: -67.6667 },
        { name: 'Huachacalla', lat: -18.7667, lng: -68.2833 },
        { name: 'Escara', lat: -18.5833, lng: -68.2500 },
        { name: 'Cruz de Machacamarca', lat: -18.1667, lng: -66.9500 },
        { name: 'Sabaya', lat: -19.0167, lng: -68.5667 },
        { name: 'Coipasa', lat: -19.2667, lng: -68.2833 },
        { name: 'La Rivera', lat: -18.0500, lng: -67.3333 },
        { name: 'Totoral', lat: -18.0667, lng: -66.9000 }
      ]
    },
    {
      name: 'Potosí',
      cities: [
        { name: 'Potosí', lat: -19.5836, lng: -65.7531 },
        { name: 'Uyuni', lat: -20.4597, lng: -66.8250 },
        { name: 'Tupiza', lat: -21.4425, lng: -65.7175 },
        { name: 'Villazón', lat: -22.0867, lng: -65.5942 },
        { name: 'Llallagua', lat: -18.4167, lng: -66.6333 },
        { name: 'Uncía', lat: -18.4667, lng: -66.5667 },
        { name: 'Colquechaca', lat: -18.6833, lng: -66.0167 },
        { name: 'Betanzos', lat: -19.5500, lng: -65.4500 },
        { name: 'Vitichi', lat: -20.9333, lng: -65.9833 },
        { name: 'Atocha', lat: -20.9500, lng: -66.2167 },
        { name: 'San Vicente', lat: -20.4000, lng: -66.1833 },
        { name: 'Colchani', lat: -20.3000, lng: -66.9333 },
        { name: 'San Cristóbal', lat: -20.8667, lng: -66.6167 },
        { name: 'Pulacayo', lat: -19.8667, lng: -66.4833 },
        { name: 'Huanchaca', lat: -20.0333, lng: -66.7333 },
        { name: 'San Antonio de Esmoruco', lat: -20.7500, lng: -66.0000 },
        { name: 'Pocoata', lat: -18.5500, lng: -66.2167 },
        { name: 'Ocurí', lat: -18.8833, lng: -65.2500 },
        { name: 'San Pablo de Lípez', lat: -21.6667, lng: -66.6833 },
        { name: 'San Pedro de Quemes', lat: -20.8333, lng: -67.7667 }
      ]
    },
    {
      name: 'Chuquisaca',
      cities: [
        { name: 'Sucre', lat: -19.0333, lng: -65.2627 },
        { name: 'Yotala', lat: -19.1667, lng: -65.2500 },
        { name: 'Tarabuco', lat: -19.1833, lng: -64.9167 },
        { name: 'Yamparáez', lat: -19.1500, lng: -65.1833 },
        { name: 'Camargo', lat: -20.6333, lng: -65.2167 },
        { name: 'Monteagudo', lat: -19.8167, lng: -63.9500 },
        { name: 'Padilla', lat: -19.3000, lng: -64.3000 },
        { name: 'Villa Serrano', lat: -19.1167, lng: -64.3167 },
        { name: 'Azurduy', lat: -19.6167, lng: -64.5667 },
        { name: 'Tarvita', lat: -19.5667, lng: -64.7333 },
        { name: 'Zudáñez', lat: -19.0500, lng: -64.6667 },
        { name: 'Presto', lat: -19.6833, lng: -64.8500 },
        { name: 'Mojocoya', lat: -19.2167, lng: -64.5500 },
        { name: 'Icla', lat: -19.5167, lng: -64.9333 },
        { name: 'Macharetí', lat: -20.8500, lng: -63.2833 },
        { name: 'Huacareta', lat: -20.7500, lng: -63.8833 },
        { name: 'Villa Vaca Guzmán (Muyupampa)', lat: -20.3500, lng: -63.6000 },
        { name: 'Culpina', lat: -21.0167, lng: -65.4333 },
        { name: 'Las Carreras', lat: -20.7167, lng: -65.3000 },
        { name: 'Incahuasi', lat: -20.8333, lng: -64.9500 }
      ]
    },
    {
      name: 'Tarija',
      cities: [
        { name: 'Tarija', lat: -21.5355, lng: -64.7296 },
        { name: 'Yacuiba', lat: -22.0333, lng: -63.6833 },
        { name: 'Bermejo', lat: -22.7333, lng: -64.3500 },
        { name: 'Villa Montes', lat: -21.2500, lng: -63.4667 },
        { name: 'Caraparí', lat: -21.8167, lng: -63.7000 },
        { name: 'Entre Ríos', lat: -21.5333, lng: -64.1667 },
        { name: 'Padcaya', lat: -21.9333, lng: -64.7167 },
        { name: 'San Lorenzo', lat: -21.4333, lng: -64.7667 },
        { name: 'El Puente', lat: -21.6667, lng: -64.8333 },
        { name: 'Uriondo', lat: -21.4833, lng: -64.6833 },
        { name: 'Concepción', lat: -21.8167, lng: -64.5167 },
        { name: 'Yunchará', lat: -22.1667, lng: -64.8667 },
        { name: 'Cercado', lat: -21.5167, lng: -64.7333 },
        { name: 'Villamontes', lat: -21.2625, lng: -63.4667 }
      ]
    },
    {
      name: 'Beni',
      cities: [
        { name: 'Trinidad', lat: -14.8333, lng: -64.9000 },
        { name: 'Riberalta', lat: -11.0089, lng: -66.0731 },
        { name: 'Guayaramerín', lat: -10.8167, lng: -65.3667 },
        { name: 'Santa Ana del Yacuma', lat: -13.7667, lng: -65.4333 },
        { name: 'San Borja', lat: -14.8500, lng: -66.7333 },
        { name: 'Rurrenabaque', lat: -14.4333, lng: -67.5333 },
        { name: 'Reyes', lat: -14.3000, lng: -67.3333 },
        { name: 'Santa Rosa', lat: -14.0000, lng: -64.3333 },
        { name: 'Magdalena', lat: -13.2500, lng: -64.0500 },
        { name: 'Baures', lat: -13.6000, lng: -63.5833 },
        { name: 'Huacaraje', lat: -13.5500, lng: -63.6833 },
        { name: 'San Ramón', lat: -13.3000, lng: -64.7167 },
        { name: 'San Joaquín', lat: -13.0500, lng: -64.8167 },
        { name: 'San Ignacio de Moxos', lat: -14.9667, lng: -65.6333 },
        { name: 'Loreto', lat: -15.1667, lng: -64.7500 },
        { name: 'San Javier', lat: -14.7500, lng: -66.0000 },
        { name: 'Exaltación', lat: -13.3500, lng: -65.4167 }
      ]
    },
    {
      name: 'Pando',
      cities: [
        { name: 'Cobija', lat: -11.0267, lng: -68.7692 },
        { name: 'Porvenir', lat: -11.1000, lng: -68.6333 },
        { name: 'Puerto Rico', lat: -11.1000, lng: -67.5500 },
        { name: 'Filadelfia', lat: -10.8000, lng: -66.1833 },
        { name: 'Bolpebra', lat: -11.2000, lng: -68.5833 },
        { name: 'Bella Flor', lat: -10.3667, lng: -66.0500 },
        { name: 'San Lorenzo', lat: -10.5667, lng: -66.3667 },
        { name: 'Sena', lat: -11.6833, lng: -69.0000 },
        { name: 'Santos Mercado', lat: -12.5000, lng: -68.7333 },
        { name: 'Puerto Gonzalo Moreno', lat: -11.2000, lng: -69.1333 },
        { name: 'Villa Nueva (Loma Alta)', lat: -10.5333, lng: -66.0833 },
        { name: 'Santa Rosa del Abuná', lat: -10.5833, lng: -65.9333 },
        { name: 'Ingavi', lat: -11.0667, lng: -68.6667 }
      ]
    }
  ]
};

export const COUNTRIES = [
  { name: 'Bolivia', code: 'BO', data: BOLIVIA_DATA }

];
