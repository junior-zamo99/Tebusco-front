import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SearchGeneralResponse,
  SearchCategoriesResponse,
  SearchProvidersResponse,
  SearchQuery
} from '../interface/search.interface';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalización no soportada por el navegador');
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => reject(error),
          { timeout: 10000, enableHighAccuracy: true }
        );
      }
    });
  }


  searchGeneral(query: SearchQuery): Observable<SearchGeneralResponse> {
    let params = new HttpParams()
      .set('term', query.term)
      .set('city', query.city);


    if (query.lat) {
      params = params.set('lat', query.lat.toString());
    }
    if (query.lng) {
      params = params.set('lng', query.lng.toString());
    }

    return this.http.get<SearchGeneralResponse>(`${this.apiUrl}`, { params });
  }


  searchCategories(term: string): Observable<SearchCategoriesResponse> {
    const params = new HttpParams().set('term', term);
    return this.http.get<SearchCategoriesResponse>(`${this.apiUrl}/categories`, { params });
  }


  searchProviders(query: SearchQuery, type?: 'professional' | 'company' | 'all'): Observable<SearchProvidersResponse> {
    let params = new HttpParams()
      .set('term', query.term)
      .set('city', query.city);

    if (query.lat) params = params.set('lat', query.lat.toString());
    if (query.lng) params = params.set('lng', query.lng.toString());

    if (type && type !== 'all') {
      params = params.set('type', type);
    }

    return this.http.get<SearchProvidersResponse>(`${this.apiUrl}/providers`, { params });
  }
}
