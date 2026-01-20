import { Injectable } from '@angular/core';
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
        reject('Geolocalización no soportada');
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          { timeout: 10000, enableHighAccuracy: true }
        );
      }
    });
  }

  searchGeneral(query: SearchQuery): Observable<SearchGeneralResponse> {
    let params = new HttpParams().set('term', query.term);

    if (query.city) {
      params = params.set('city', query.city.toString());
    }

    if (query.cities && query.cities.length > 0) {
      query.cities.forEach(id => {
        params = params.append('cities[]', id.toString());
      });
    }

    if (query.sex) {
      params = params.set('sex', query.sex);
    }

    return this.http.get<SearchGeneralResponse>(`${this.apiUrl}`, { params });
  }

  searchCategories(term: string): Observable<SearchCategoriesResponse> {
    const params = new HttpParams().set('term', term);
    return this.http.get<SearchCategoriesResponse>(`${this.apiUrl}/categories`, { params });
  }

  searchProviders(query: SearchQuery, type?: 'professional' | 'company' | 'all'): Observable<SearchProvidersResponse> {
    let params = new HttpParams().set('term', query.term);

    if (query.city) {
      params = params.set('city', query.city.toString());
    }

    if (type && type !== 'all') {
      params = params.set('type', type);
    }

    return this.http.get<SearchProvidersResponse>(`${this.apiUrl}/providers`, { params });
  }
}
