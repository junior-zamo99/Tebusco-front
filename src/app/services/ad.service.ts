import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ad } from '../models/ad.model';

interface ApiResponse {
  success: boolean;
  message: string;
  data: Ad[];
}
@Injectable({
  providedIn: 'root'
})
export class AdService {
  private apiUrl = `${environment.apiUrl}/app/ads/active`;

  constructor(private http: HttpClient) {}

  getActiveAds(): Observable<Ad[]> {
    return this.http.get<ApiResponse>(this.apiUrl, {
      withCredentials: true
    }).pipe(

      map(response => response.data),

    );
  }
}

