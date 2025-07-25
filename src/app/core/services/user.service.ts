// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { User } from '../models/user.model';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  department?: string;
  role?: string;
  is_active: boolean;
  last_login?: string;
  date_joined: string;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
    timezone?: string;
  };
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  department?: string;
  avatar?: File;
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
    timezone?: string;
  };
}

export interface UserStatistics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  avg_completion_time: number;
  total_projects: number;
  active_projects: number;
  recent_activity: {
    date: string;
    action: string;
    description: string;
  }[];
}

export interface UserSearchFilters {
  search?: string;
  department?: string;
  role?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private usersSubject = new BehaviorSubject<UserProfile[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get all users with filters
  getUsers(filters?: UserSearchFilters): Observable<PaginatedResponse<UserProfile>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof UserSearchFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<UserProfile>>(API_ENDPOINTS.USERS.BASE, { params }).pipe(
      tap(response => this.usersSubject.next(response.data))
    );
  }

  // Get user by ID
  getUserById(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(API_ENDPOINTS.USERS.BY_ID(id));
  }

  // Get current user profile
  getCurrentUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(API_ENDPOINTS.USERS.PROFILE).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  // Update user profile
  updateProfile(profileData: UpdateProfileRequest): Observable<UserProfile> {
    const formData = new FormData();
    
    Object.keys(profileData).forEach(key => {
      const value = profileData[key as keyof UpdateProfileRequest];
      if (value !== undefined && value !== null) {
        if (key === 'avatar' && value instanceof File) {
          formData.append('avatar', value);
        } else if (key === 'preferences') {
          formData.append('preferences', JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return this.http.put<UserProfile>(API_ENDPOINTS.USERS.PROFILE, formData).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  // Search users
  searchUsers(query: string, filters?: UserSearchFilters): Observable<UserProfile[]> {
    let params = new HttpParams().set('q', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof UserSearchFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<UserProfile[]>(API_ENDPOINTS.USERS.SEARCH, { params });
  }

  // Get user statistics
  getUserStatistics(userId?: number): Observable<UserStatistics> {
    const endpoint = userId 
      ? `${API_ENDPOINTS.USERS.STATISTICS}?user_id=${userId}`
      : API_ENDPOINTS.USERS.STATISTICS;
    
    return this.http.get<UserStatistics>(endpoint);
  }

  // Get user's task assignments
  getUserTasks(userId: number, status?: string): Observable<any[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    
    return this.http.get<any[]>(`${API_ENDPOINTS.USERS.BY_ID(userId)}/tasks`, { params });
  }

  // Get user's projects
  getUserProjects(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_ENDPOINTS.USERS.BY_ID(userId)}/projects`);
  }

  // Upload user avatar
  uploadAvatar(file: File): Observable<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post<{ avatar_url: string }>(`${API_ENDPOINTS.USERS.PROFILE}/avatar`, formData);
  }

  // Change password
  changePassword(oldPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_ENDPOINTS.USERS.PROFILE}/change-password`, {
      old_password: oldPassword,
      new_password: newPassword
    });
  }

  // Get user activity log
  getUserActivityLog(userId?: number): Observable<any[]> {
    const endpoint = userId 
      ? `${API_ENDPOINTS.USERS.BY_ID(userId)}/activity`
      : `${API_ENDPOINTS.USERS.PROFILE}/activity`;
    
    return this.http.get<any[]>(endpoint);
  }

  // Update user preferences
  updatePreferences(preferences: any): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${API_ENDPOINTS.USERS.PROFILE}/preferences`, preferences).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  // Get user notifications settings
  getNotificationSettings(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.USERS.PROFILE}/notification-settings`);
  }

  // Update notification settings
  updateNotificationSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${API_ENDPOINTS.USERS.PROFILE}/notification-settings`, settings);
  }

  // Deactivate user account
  deactivateAccount(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API_ENDPOINTS.USERS.PROFILE}/deactivate`, {});
  }

  // Get users for assignment (simplified user list)
  getUsersForAssignment(): Observable<{ id: number; name: string; email: string }[]> {
    return this.http.get<{ id: number; name: string; email: string }[]>(`${API_ENDPOINTS.USERS.BASE}/assignment-list`);
  }

  // Get current user from subject
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  // Set current user (useful after login)
  setCurrentUser(user: UserProfile): void {
    this.currentUserSubject.next(user);
  }

  // Clear current user (logout)
  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  // Get users list from subject
  getUsers$(): Observable<UserProfile[]> {
    return this.users$;
  }
}