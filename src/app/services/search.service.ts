import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SearchGeneralResponse,
  SearchCategoriesResponse,
  SearchProvidersResponse
} from '../interface/search.interface';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  searchGeneral(term: string): Observable<SearchGeneralResponse> {
    const params = new HttpParams().set('term', term);
    return this.http.get<SearchGeneralResponse>(this.apiUrl, { params });
  }

  searchCategories(term: string): Observable<SearchCategoriesResponse> {
    const params = new HttpParams().set('term', term);
    return this.http.get<SearchCategoriesResponse>(`${this.apiUrl}/categories`, { params });
  }

  searchProviders(term: string, type?: 'professional' | 'company' | 'all'): Observable<SearchProvidersResponse> {
    let params = new HttpParams().set('term', term);
    if (type && type !== 'all') {
      params = params.set('type', type);
    }
    return this.http.get<SearchProvidersResponse>(`${this.apiUrl}/providers`, { params });
  }
}

