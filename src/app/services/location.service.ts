import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export interface LocationData {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
  source: 'browser' | 'ip' | 'default';
  precision: 'high' | 'medium' | 'low';
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private readonly DEFAULT_LOCATION: LocationData = {
    lat: -16.5000,
    lng: -68.1500,
    city: 'La Paz',
    state: 'La Paz',
    country: 'Bolivia',
    source: 'default',
    precision: 'low'
  };

  private getLocationFromBrowser(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no disponible'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<LocationData> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&lat=${lat}&lon=${lng}&` +
        `accept-language=es&` +
        `addressdetails=1`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'TeBuscoApp/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Error en reverse geocoding');
      }

      const data = await response.json();
      const address = data.address || {};


      return {
        lat,
        lng,
        city: address.city || address.town || address.village || address.municipality || '',
        state: address.state || address.region || '',
        country: address.country || 'Bolivia',
        source: 'browser',
        precision: 'high'
      };
    } catch (error) {
      return {
        lat,
        lng,
        source: 'browser',
        precision: 'high'
      };
    }
  }


  private async getLocationFromIP(): Promise<LocationData | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Error fetching IP location');

      const data = await response.json();


      return {
        lat: data.latitude || this.DEFAULT_LOCATION.lat,
        lng: data.longitude || this.DEFAULT_LOCATION.lng,
        city: data.city || '',
        state: data.region || '',
        country: data.country_name || 'Bolivia',
        source: 'ip',
        precision: 'medium'
      };
    } catch (error) {
      return null;
    }
  }


  async getQuickLocation(): Promise<LocationData> {
    try {
      const coords = await this.getLocationFromBrowser();

      const location = await this.reverseGeocode(coords.lat, coords.lng);

      return location;

    } catch (browserError) {

      try {
        const ipLocation = await this.getLocationFromIP();

        if (ipLocation) {
          return ipLocation;
        }
      } catch (ipError) {
      }
      return this.DEFAULT_LOCATION;
    }
  }

  getLocationObservable(): Observable<LocationData> {
    return from(this.getQuickLocation()).pipe(
      timeout(15000),
      catchError((error) => {
        console.error('❌ Error obteniendo ubicación:', error);
        return of(this.DEFAULT_LOCATION);
      })
    );
  }

  async getCoordinates(): Promise<{ lat: number; lng: number }> {
    try {
      return await this.getLocationFromBrowser();
    } catch {
      return {
        lat: this.DEFAULT_LOCATION.lat,
        lng: this.DEFAULT_LOCATION.lng
      };
    }
  }


  async requestPermission(): Promise<boolean> {
    try {
      await this.getLocationFromBrowser();
      return true;
    } catch {
      return false;
    }
  }
}
