import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProfileView {
  id: number;
  professionalId: number;
  applicantId: number;
  viewCount: number;
  firstViewedAt: string;
  lastViewedAt: string;
}

export interface ViewerStats {
  id: number;
  applicantId: number;
  applicantName: string;
  applicantEmail: string;
  viewCount: number;
  firstViewedAt: string;
  lastViewedAt: string;
}

export interface RegisterViewResponse {
  success: boolean;
  message: string;
  data: ProfileView;
}

export interface GetViewersResponse {
  success: boolean;
  message: string;
  data: ViewerStats[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileViewsService {
  private apiUrl = `${environment.apiUrl}/profile-views`;

  constructor(private http: HttpClient) {}


  registerView(professionalId: number): Observable<RegisterViewResponse> {
    return this.http.post<RegisterViewResponse>(
      `${this.apiUrl}/${professionalId}`,
      {}, // Body vacío como indica la documentación
      { withCredentials: true }
    );
  }


  getMyViewers(): Observable<GetViewersResponse> {
    return this.http.get<GetViewersResponse>(
      `${this.apiUrl}/my-viewers`,
      { withCredentials: true }
    );
  }
}
