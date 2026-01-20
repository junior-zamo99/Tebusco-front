import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <--- NECESARIO
import { environment } from '../../environments/environment';
import {
  Country,
  City,
  CreateCountryDTO,
  CreateCityDTO,
  UpdateCityDTO
} from '../models/location.model';

// Interfaz local para manejar la respuesta envolvente del backend
interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) {}

  getCountries(includeCities: boolean = false): Observable<Country[]> {
    let params = new HttpParams();
    if (includeCities) {
      params = params.set('includeCities', 'true');
    }

    // CORRECCIÓN: Usamos pipe(map(...)) para extraer .data
    return this.http.get<BackendResponse<Country[]>>(`${this.apiUrl}/countries`, { params }).pipe(
      map(response => response.data)
    );
  }

  createCountry(data: CreateCountryDTO): Observable<Country> {
    return this.http.post<BackendResponse<Country>>(`${this.apiUrl}/countries`, data).pipe(
      map(response => response.data)
    );
  }

  CitiesByCountry(countryId: number): Observable<City[]> {
    // CORRECCIÓN: Usamos pipe(map(...)) para extraer .data
    return this.http.get<BackendResponse<City[]>>(`${this.apiUrl}/countries/${countryId}/cities`).pipe(
      map(response => response.data)
    );
  }

  createCity(data: CreateCityDTO): Observable<City> {
    return this.http.post<BackendResponse<City>>(`${this.apiUrl}/cities`, data).pipe(
      map(response => response.data)
    );
  }

  getCityById(id: number): Observable<City> {
    return this.http.get<BackendResponse<City>>(`${this.apiUrl}/cities/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateCity(id: number, data: UpdateCityDTO): Observable<City> {
    return this.http.put<BackendResponse<City>>(`${this.apiUrl}/cities/${id}`, data).pipe(
      map(response => response.data)
    );
  }

  deleteCity(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/cities/${id}`);
  }

  seedBolivia(): Observable<string> {
    return this.http.post(`${this.apiUrl}/seed/bolivia`, {}, { responseType: 'text' });
  }
}
