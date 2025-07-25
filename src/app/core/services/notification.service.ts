import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, interval } from 'rxjs';
import { map, catchError, tap, switchMap, startWith } from 'rxjs/operators';

import { API_ENDPOINTS, APP_CONFIG } from '../constants/api.constants';
import { 
  Notification, 
  CreateNotificationRequest,
  NotificationSummary,
  ApiResponse,
  PaginatedResponse
} from '../models';

export interface NotificationFilters {
  type?: string;
  is_read?: boolean;
  user_id?: number;
  related_task_id?: number;
  related_project_id?: number;
  related_sprint_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  // Auto-refresh notifications every 30 seconds
  public autoRefresh$ = interval(APP_CONFIG.NOTIFICATION_CHECK_INTERVAL)
    .pipe(
      startWith(0),
      switchMap(() => this.getNotifications())
    );

  constructor(private http: HttpClient) {
    // Initialize notifications on service creation
    this.initializeNotifications();
  }

  private initializeNotifications(): void {
    this.getNotifications().subscribe();
    this.getNotificationSummary().subscribe();
  }

  startPolling(): void {
    // Start auto-refresh
    this.autoRefresh$.subscribe();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  getNotifications(filters?: NotificationFilters): Observable<PaginatedResponse<Notification>> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Notification>>(API_ENDPOINTS.NOTIFICATIONS.BASE, { params })
      .pipe(
        tap(response => {
          this.notificationsSubject.next(response.data);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getNotificationSummary(): Observable<NotificationSummary> {
    return this.http.get<ApiResponse<NotificationSummary>>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/summary`)
      .pipe(
        map(response => response.data!),
        tap(summary => {
          this.unreadCountSubject.next(summary.unread_count);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  markAllAsRead(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, {})
      .pipe(
        tap(() => {
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notif => ({
            ...notif,
            is_read: true,
            read_at: new Date().toISOString()
          }));
          this.notificationsSubject.next(updatedNotifications);
          this.unreadCountSubject.next(0);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.loadingSubject.next(false);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors && error.error.errors.length > 0) {
        errorMessage = error.error.errors[0];
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Notification Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}