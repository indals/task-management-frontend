// src/app/core/services/auth.service.ts
// Update with your actual API URL
// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

import { User, UserListItem } from '../models';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ChangePasswordRequest 
} from '../interfaces/api.interfaces';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';

// Export types for external use
export type { User, UserListItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    
    if (token && user && !this.jwtHelper.isTokenExpired(token)) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(registerData: RegisterRequest): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(
      API_ENDPOINTS.AUTH.REGISTER, 
      registerData
    ).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, loginData)
      .pipe(
        tap(response => this.setAuthData(response)),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  logout(): void {
    this.clearAuthData();
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(API_ENDPOINTS.AUTH.ME)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  updateProfile(userData: { name?: string; email?: string; password?: string }): Observable<{ message: string; user: User }> {
    return this.http.put<{ message: string; user: User }>(
      API_ENDPOINTS.AUTH.PROFILE, 
      userData
    ).pipe(
      tap(response => this.updateStoredUser(response.user)),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    const request: ChangePasswordRequest = {
      current_password: currentPassword,
      new_password: newPassword
    };
    
    return this.http.post<{ message: string }>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD, 
      request
    ).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUsers(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(API_ENDPOINTS.AUTH.USERS)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  ping(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(API_ENDPOINTS.AUTH.PING)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Private helper methods
  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  private clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.currentUserSubject.next(null);
  }

  private updateStoredUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}