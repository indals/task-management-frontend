import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  private readonly jwtHelper = new JwtHelperService();

  constructor(private readonly http: HttpClient) {
    this.initializeUser();
  }

  /**
   * Initialize user from stored token and user data
   */
  private initializeUser(): void {
    const token = localStorage.getItem(environment.tokenKey);
    const user = localStorage.getItem(environment.userKey);
    
    if (token && user && !this.jwtHelper.isTokenExpired(token)) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(registerData: RegisterRequest): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`${this.apiUrl}/register`, registerData);
  }

  /**
   * Authenticate user with credentials
   */
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
        })
      );
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    this.clearAuthData();
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(environment.tokenKey, response.access_token);
    localStorage.setItem(environment.userKey, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.userKey);
    this.currentUserSubject.next(null);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  /**
   * Update user profile
   */
  updateProfile(userData: { name?: string; email?: string; password?: string }): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(`${this.apiUrl}/profile`, userData)
      .pipe(
        tap(response => {
          localStorage.setItem(environment.userKey, JSON.stringify(response.user));
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

  /**
   * Check if user is authenticated
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem(environment.tokenKey);
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
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