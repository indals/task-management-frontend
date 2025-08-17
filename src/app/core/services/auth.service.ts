import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/api.constants';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  RefreshTokenRequest,
  ChangePasswordRequest,
  ProfileUpdateRequest,
  User,
  AuthUser,
  ApiResponse
} from '../models';

// FIXED: Add missing types that components expect
export interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  redirectUrl: string = '/dashboard';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  // 🔧 FIXED: Updated login to handle new response format
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loadingSubject.next(true);
    console.log('Attempting login with credentials:', credentials);

    return this.http.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, credentials)
      .pipe(
        map(response => {
          // Handle new response format: { success: true, data: AuthResponse, ... }
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Login failed');
          }
        }),
        tap(authResponse => {
          this.handleAuthSuccess(authResponse);
          console.log('Login successful:', authResponse);
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.loadingSubject.next(false))
      );
  }

  // 🔧 FIXED: Updated register to handle new response format  
  register(userData: RegisterRequest): Observable<User> {
    this.loadingSubject.next(true);
    
    return this.http.post<ApiResponse<{ user: User }>>(API_ENDPOINTS.AUTH.REGISTER, userData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data.user;
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.loadingSubject.next(false))
      );
  }

  // 🔧 FIXED: Updated refreshToken to handle new response format
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const request: RefreshTokenRequest = { refresh_token: refreshToken };
    
    return this.http.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REFRESH, request)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Token refresh failed');
          }
        }),
        tap(authResponse => {
          this.handleAuthSuccess(authResponse);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.loadingSubject.next(true);
    
    // Clear local storage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    // Update subjects
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.loadingSubject.next(false);
    
    // Redirect to login
    this.router.navigate(['/auth/login']);
  }

  // 🔧 FIXED: Updated getCurrentUser to handle new response format
  getCurrentUser(): Observable<User> {
    return this.http.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to get user profile');
          }
        }),
        tap(user => {
          this.currentUserSubject.next(user);
          this.storeUser(user);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 FIXED: Updated updateProfile to handle new response format
  updateProfile(profileData: ProfileUpdateRequest): Observable<User> {
    this.loadingSubject.next(true);
    
    return this.http.put<ApiResponse<User>>(API_ENDPOINTS.AUTH.PROFILE, profileData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to update profile');
          }
        }),
        tap(user => {
          this.currentUserSubject.next(user);
          this.storeUser(user);
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.loadingSubject.next(false))
      );
  }

  // 🔧 FIXED: Updated changePassword to handle new response format
  changePassword(passwordData: ChangePasswordRequest): Observable<ApiResponse> {
    this.loadingSubject.next(true);
    
    return this.http.post<ApiResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to change password');
          }
          return response;
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.loadingSubject.next(false))
      );
  }

  // 🔧 FIXED: Updated getUsers to handle new response format
  getUsers(): Observable<UserListItem[]> {
    return this.http.get<ApiResponse<User[]>>(API_ENDPOINTS.AUTH.USERS)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            const users = response.data;
            return users.map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar_url: user.avatar_url,
              is_active: user.is_active
            }));
          } else {
            throw new Error(response.message || 'Failed to get users');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 FIXED: Updated ping to handle new response format
  ping(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(API_ENDPOINTS.AUTH.PING)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Ping failed');
          }
          return response;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // Utility methods
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    
    return this.isAuthenticatedSubject.value;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Consider invalid tokens as expired
    }
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUserValue();
    return user ? roles.includes(user.role) : false;
  }

  private handleAuthSuccess(authResponse: AuthResponse): void {
    console.log('Handling auth success:', authResponse);
    // Store tokens
    localStorage.setItem(STORAGE_KEYS.TOKEN, authResponse.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refresh_token);
    
    // Store user
    this.storeUser(authResponse.user);
    
    // Update subjects
    this.currentUserSubject.next(authResponse.user);
    this.isAuthenticatedSubject.next(true);
  }

  private storeUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  // 🔧 IMPROVED: Better error handling for new response format
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error - handle new response format
      if (error.error?.success === false) {
        // New standardized error format
        errorMessage = error.error.message || `Error ${error.status}`;
      } else if (error.error?.message) {
        // Legacy error format
        errorMessage = error.error.message;
      } else if (error.error?.errors && error.error.errors.length > 0) {
        errorMessage = error.error.errors[0];
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Auth Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}