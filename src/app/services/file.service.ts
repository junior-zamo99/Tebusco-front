import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.apiUrl}/upload`, formData,
      { withCredentials: true }
    );
  }

  uploadPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload/photo`, formData, { withCredentials: true });
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload/avatar`, formData, { withCredentials: true });
  }

  getFileById(fileId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${fileId}`,
      { withCredentials: true }
    );
  }

  deleteFile(fileId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${fileId}`,
      { withCredentials: true }
    );
  }
}
