import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  
  constructor(private http: HttpClient) {}
  
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }
  
  setToken(token: string): void {
    localStorage.setItem('task-token', token);
  }
  
  getToken(): string | null {
    return localStorage.getItem('task-token');
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}