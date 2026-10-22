import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CurrentUser, PropertyItem } from '../models/property.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = typeof window !== 'undefined' ? localStorage.getItem('myhome_token') : null;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getProperties(filters: Record<string, string>): Observable<{ properties: PropertyItem[] }> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, v);
      }
    });
    return this.http.get<{ properties: PropertyItem[] }>(`${this.baseUrl}/properties`, { params });
  }

  createProperty(data: any): Observable<{ property: PropertyItem }> {
    return this.http.post<{ property: PropertyItem }>(`${this.baseUrl}/properties`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  getMe(): Observable<{ user: CurrentUser | null }> {
    return this.http.get<{ user: CurrentUser | null }>(`${this.baseUrl}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
  }

  login(payload: { email: string; password: string }): Observable<{ token: string; user: CurrentUser }> {
    return this.http.post<{ token: string; user: CurrentUser }>(`${this.baseUrl}/auth/login`, payload);
  }

  register(payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Observable<{ token: string; user: CurrentUser }> {
    return this.http.post<{ token: string; user: CurrentUser }>(`${this.baseUrl}/auth/register`, payload);
  }

  toggleFavorite(propertyId: string): Observable<{ favorited: boolean }> {
    return this.http.post<{ favorited: boolean }>(
      `${this.baseUrl}/favorites/toggle`,
      { propertyId },
      { headers: this.getAuthHeaders() },
    );
  }
}
