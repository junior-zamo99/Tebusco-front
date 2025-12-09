import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import * as L from 'leaflet';
import { DecimalPipe } from '@angular/common';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    postcode?: string;
    fullAddress?: string;
  };
}

@Component({
  selector: 'app-map-location-picker',
  imports: [DecimalPipe],
  templateUrl: './map-location-picker.html',
  styleUrl: './map-location-picker.css',
})
export class MapLocationPickerComponent implements OnInit, OnDestroy {

  @Input() initialLat: number = -17.78629;
  @Input() initialLng: number = -63.18117;
  @Input() initialZoom: number = 13;
  @Input() height: string = '400px';
  @Input() showReverseGeocode: boolean = true;

  @Output() locationSelected = new EventEmitter<LocationCoordinates>();

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  selectedLocation: LocationCoordinates | null = null;
  isDetectingLocation: boolean = false;
  locationError: string = '';

  ngOnInit(): void {
    this.setupLeafletIcons();
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  private setupLeafletIcons(): void {
    const iconRetinaUrl = 'assets/marker-icon.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = '' ;

    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = iconDefault;
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    const mapElement = document.getElementById('leaflet-map');
    if (!mapElement) {
      console.error('❌ Elemento del mapa no encontrado');
      return;
    }

    this.map = L.map('leaflet-map').setView(
      [this.initialLat, this.initialLng],
      this.initialZoom
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e);
    });

  }

  private onMapClick(e: L.LeafletMouseEvent): void {
    const { lat, lng } = e.latlng;

    this.selectedLocation = {
      lat,
      lng
    };

    this.addMarker(lat, lng);
    this.locationError = '';

    if (this.showReverseGeocode) {
      this.reverseGeocode(lat, lng);
    } else {
      this.locationSelected.emit(this.selectedLocation);
    }

  }


  public detectMyLocation(): void {
    if (!navigator.geolocation) {
      this.locationError = 'Tu navegador no soporta geolocalización';
      return;
    }

    this.isDetectingLocation = true;
    this.locationError = '';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;


        this.centerMap(lat, lng, 16);

        this.selectedLocation = { lat, lng };

        if (this.showReverseGeocode) {
          this.reverseGeocode(lat, lng);
        } else {
          this.locationSelected.emit(this.selectedLocation);
        }

        this.isDetectingLocation = false;
      },
      (error) => {

        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Permiso de ubicación denegado. Por favor, habilita el acceso en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Ubicación no disponible. Intenta nuevamente.';
            break;
          case error.TIMEOUT:
            this.locationError = 'Tiempo de espera agotado. Intenta nuevamente.';
            break;
          default:
            this.locationError = 'Error desconocido al obtener ubicación.';
        }

        this.isDetectingLocation = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  private addMarker(lat: number, lng: number): void {
    if (!this.map) return;

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker([lat, lng]).addTo(this.map);

    const popupContent = `
      <div class="text-center">
        <p class="font-semibold text-gray-900 mb-1">📍 Ubicación Seleccionada</p>
        <p class="text-sm text-gray-600">Lat: ${lat.toFixed(6)}</p>
        <p class="text-sm text-gray-600">Lng: ${lng.toFixed(6)}</p>
      </div>
    `;

    this.marker.bindPopup(popupContent).openPopup();
  }

 private reverseGeocode(lat: number, lng: number): void {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es&addressdetails=1`, {
    headers: {
      'User-Agent': 'TeBuscoApp/1.0'
    }
  })
    .then(response => response.json())
    .then(data => {
      const address = data.address;

      if (this.selectedLocation) {
        const addressParts: string[] = [];

        if (address.road) {
          addressParts.push(address.road);
        }

        if (address.house_number) {
          addressParts.push(`#${address.house_number}`);
        }

        if (address.neighbourhood) {
          addressParts.push(`Zona ${address.neighbourhood}`);
        } else if (address.suburb) {
          addressParts.push(`Zona ${address.suburb}`);
        }

        const fullAddress = addressParts.length > 0
          ? addressParts.join(', ')
          : '';

        this.selectedLocation.address = {
          country: address.country || '',
          state: address.state || address.region || '',
          city: address.city || address.town || address.village || address.municipality || '',
          postcode: address.postcode || '',
          fullAddress: fullAddress
        };

        this.locationSelected.emit(this.selectedLocation);

        if (this.marker) {
          const popupContent = `
            <div class="text-center" style="min-width: 200px;">
              <p class="font-semibold text-gray-900 mb-2">📍 Ubicación Seleccionada</p>
              ${fullAddress ? `<p class="text-sm text-gray-700 mb-2 font-semibold">${fullAddress}</p>` : ''}
              <p class="text-sm text-gray-600 mb-1">${this.selectedLocation.address.city || 'Ciudad'}</p>
              <p class="text-sm text-gray-600">${this.selectedLocation.address.state || ''}</p>
              <p class="text-sm text-gray-600">${this.selectedLocation.address.country || ''}</p>
              <p class="text-xs text-gray-500 mt-2">Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</p>
            </div>
          `;
          this.marker.setPopupContent(popupContent);
        }
      }
    })
    .catch(error => {
      console.error('❌ Error en reverse geocoding:', error);

      if (this.selectedLocation) {
        this.locationSelected.emit(this.selectedLocation);
      }
    });
}
  public centerMap(lat: number, lng: number, zoom?: number): void {
    if (this.map) {
      this.map.setView([lat, lng], zoom || this.initialZoom);
      this.addMarker(lat, lng);
    }
  }

  public clearMarker(): void {
    if (this.marker && this.map) {
      this.map.removeLayer(this.marker);
      this.marker = null;
      this.selectedLocation = null;
      this.locationError = '';
    }
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }
}
