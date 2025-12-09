import { Component, Input, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface LocationData {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  fullAddress?: string;
  label?: string;
}

@Component({
  selector: 'app-map-location-viewer',
  imports: [CommonModule],
  templateUrl: './map-location-viewer.html',
  styleUrl: './map-location-viewer.css',
})
export class MapLocationViewer implements OnInit, OnDestroy, AfterViewInit {
  @Input() location!: LocationData;
  @Input() height: string = '400px';
  @Input() zoom: number = 15;
  @Input() showFullAddress: boolean = true;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  showRecenterButton = false;

  ngOnInit(): void {
    this.setupLeafletIcons();
  }

  ngAfterViewInit(): void {
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
    const shadowUrl = '';

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
    if (!this.location || !this.location.lat || !this.location.lng) {
      console.warn('⚠️ No hay coordenadas válidas para mostrar el mapa');
      return;
    }

    const mapElement = document.getElementById('location-viewer-map');
    if (!mapElement) {
      console.error('❌ Elemento del mapa no encontrado');
      return;
    }

    this.map = L.map('location-viewer-map', {
      center: [this.location.lat, this.location.lng],
      zoom: this.zoom,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      touchZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.addMarker();

    this.map.on('movestart', () => {
      this.showRecenterButton = true;
    });

    // ✅ Ocultar botón si vuelve a la posición original
    this.map.on('moveend', () => {
      const center = this.map?.getCenter();
      if (center && this.isNearOriginalLocation(center)) {
        this.showRecenterButton = false;
      }
    });

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private addMarker(): void {
    if (!this.map || !this.location) return;

    const { lat, lng } = this.location;

    this.marker = L.marker([lat, lng]).addTo(this.map);

    const popupContent = this.createPopupContent();

    this.marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'custom-popup'
    }).openPopup();
  }

  private createPopupContent(): string {
    const parts: string[] = [];

    if (this.location.label) {
      parts.push(`<p class="font-bold text-gray-500 mb-2 text-base"> ${this.location.label}</p>`);
    } else {
      parts.push(`<p class="font-bold text-gray-500 mb-2 text-base"> Ubicación</p>`);
    }

    if (this.showFullAddress && this.location.fullAddress) {
      parts.push(`<p class="text-sm text-gray-200 mb-2">${this.location.fullAddress}</p>`);
    } else if (this.showFullAddress && this.location.address) {
      parts.push(`<p class="text-sm text-gray-200 mb-2">${this.location.address}</p>`);
    }

    const locationParts: string[] = [];
    if (this.location.city) locationParts.push(this.location.city);
    if (this.location.state) locationParts.push(this.location.state);
    if (this.location.country) locationParts.push(this.location.country);

    if (locationParts.length > 0) {
      parts.push(`<p class="text-sm text-gray-100 mb-2">${locationParts.join(', ')}</p>`);
    }


    return `<div class="text-center" style="min-width: 200px;">${parts.join('')}</div>`;
  }

  public recenterMap(): void {
    if (!this.map || !this.location) return;

    this.map.setView([this.location.lat, this.location.lng], this.zoom, {
      animate: true,
      duration: 0.5
    });

    if (this.marker) {
      this.marker.openPopup();
    }

    this.showRecenterButton = false;
  }

  private isNearOriginalLocation(center: L.LatLng): boolean {
    if (!this.location) return false;

    const threshold = 0.001; // ~100 metros
    const latDiff = Math.abs(center.lat - this.location.lat);
    const lngDiff = Math.abs(center.lng - this.location.lng);

    return latDiff < threshold && lngDiff < threshold;
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }
}
