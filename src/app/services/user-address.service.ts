import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  UserAddress,
  CreateUserAddressDTO,
  CreateLocationDTO,
  UpdateUserAddressDTO,
  GetAddressFilterDTO
} from '../models/user-address.models';

@Injectable({
  providedIn: 'root'
})
export class UserAddressService {
  private apiUrl = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) {}

  createAddress(data: CreateUserAddressDTO): Observable<UserAddress> {
    return this.http.post<UserAddress>(
      this.apiUrl,
      data,
      { withCredentials: true }
    );
  }

  createLocation(data: CreateLocationDTO): Observable<UserAddress> {
    return this.http.post<UserAddress>(
      `${this.apiUrl}/location`,
      data,
      { withCredentials: true }
    );
  }



  getMyAddresses(filters?: GetAddressFilterDTO): Observable<UserAddress[]> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.append(key, value.toString());
        }
      });
    }

    return this.http.get<UserAddress[]>(
      this.apiUrl,
      { params, withCredentials: true }
    );
  }

  getDefaultAddress(): Observable<UserAddress> {
    return this.http.get<UserAddress>(
      `${this.apiUrl}/default`,
      { withCredentials: true }
    );
  }


  getNearbyAddresses(lat: number, lng: number, radiusKm: number = 10): Observable<UserAddress[]> {
    let params = new HttpParams()
      .set('lat', lat.toString())
      .set('lng', lng.toString())
      .set('radius', radiusKm.toString());

    return this.http.get<UserAddress[]>(
      `${this.apiUrl}/nearby`,
      { params, withCredentials: true }
    );
  }

  getAddressesByCity(city: string): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(
      `${this.apiUrl}/city/${city}`,
      { withCredentials: true }
    );
  }

  getAddressesByCountry(country: string): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(
      `${this.apiUrl}/country/${country}`,
      { withCredentials: true }
    );
  }

  getAddressByApplicant(applicantId: number): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(
      `${this.apiUrl}/applicant/${applicantId}`,
      { withCredentials: true }
    );
  }

  getAddressByProfessional(professionalId: number): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(
      `${this.apiUrl}/professional/${professionalId}`,
      { withCredentials: true }
    );
  }

  getAddressById(addressId: number): Observable<UserAddress> {
    return this.http.get<UserAddress>(
      `${this.apiUrl}/${addressId}`,
      { withCredentials: true }
    );
  }



  updateAddress(addressId: number, data: UpdateUserAddressDTO): Observable<UserAddress> {
    return this.http.put<UserAddress>(
      `${this.apiUrl}/${addressId}`,
      data,
      { withCredentials: true }
    );
  }

  deleteAddress(addressId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${addressId}`,
      { withCredentials: true }
    );
  }

  setDefaultAddress(addressId: number): Observable<UserAddress> {
    return this.http.put<UserAddress>(
      `${this.apiUrl}/${addressId}/default`,
      {},
      { withCredentials: true }
    );
  }

  activateAddress(addressId: number): Observable<UserAddress> {
    return this.http.put<UserAddress>(
      `${this.apiUrl}/${addressId}/activate`,
      {},
      { withCredentials: true }
    );
  }

  deactivateAddress(addressId: number): Observable<UserAddress> {
    return this.http.put<UserAddress>(
      `${this.apiUrl}/${addressId}/deactivate`,
      {},
      { withCredentials: true }
    );
  }

  updateCoordinates(addressId: number, lat: number, lng: number): Observable<UserAddress> {
    return this.http.put<UserAddress>(
      `${this.apiUrl}/${addressId}/coordinates`,
      { lat, lng },
      { withCredentials: true }
    );
  }
}
