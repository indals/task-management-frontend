// src/app/core/services/auth.service.ts
// Update with your actual API URL
// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
// import { environment } from '../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

// Updated interfaces to match API
// Auth service में User interface को update करें:
export interface User {
  id: number;
  username: string;
  name: string;     // Add this line
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface UserListItem {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private apiUrl = `${environment.apiUrl}/api/auth`;
  private apiUrl = 'http://127.0.0.1:5000/api/auth'; 
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {
    // Check if the user is already logged in
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user && !this.jwtHelper.isTokenExpired(token)) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(registerData: RegisterRequest): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`${this.apiUrl}/register`, registerData);
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          // Store user details and token in local storage
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    // Remove user from local storage and set current user to null
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateProfile(userData: { name?: string; email?: string; password?: string }): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/profile`, userData)
      .pipe(
        tap(response => {
          // Update the current user data
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Updated to match API response - returns only id and name
  getUsers(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(`${this.apiUrl}/users`);
  }

  // Health check endpoint
  ping(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.apiUrl}/ping`);
  }
}