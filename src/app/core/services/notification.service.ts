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

// FIXED: Add AppNotification interface that components expect
export interface AppNotification {
  id: number;
  message: string;
  read: boolean;
  createdAt: Date;
  type?: string;
  title?: string;
  user_id?: number;
  action_url?: string;
}

// Export the interface so it can be used elsewhere
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
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
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

  // FIXED: Method that components are calling with boolean parameter
  getNotifications(unreadOnly: boolean = false): Observable<AppNotification[]> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (unreadOnly) {
      params = params.set('is_read', 'false');
    }

    return this.http.get<PaginatedResponse<Notification>>(API_ENDPOINTS.NOTIFICATIONS.BASE, { params })
      .pipe(
        map(response => {
          // Convert API notifications to AppNotification format
          return response.data.map(this.convertToAppNotification);
        }),
        tap(notifications => {
          this.notificationsSubject.next(notifications);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // Original method with filters
  getNotificationsWithFilters(filters?: NotificationFilters): Observable<PaginatedResponse<Notification>> {
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
          const appNotifications = response.data.map(this.convertToAppNotification);
          this.notificationsSubject.next(appNotifications);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getNotificationById(id: number): Observable<Notification> {
    return this.http.get<ApiResponse<Notification>>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  // FIXED: Method that components are calling
  markAsRead(id: number): Observable<AppNotification> {
    return this.http.post<ApiResponse<Notification>>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {})
      .pipe(
        map(response => this.convertToAppNotification(response.data!)),
        tap(updatedNotification => {
          const currentNotifications = this.notificationsSubject.value;
          const index = currentNotifications.findIndex(notif => notif.id === id);
          if (index !== -1) {
            currentNotifications[index] = updatedNotification;
            this.notificationsSubject.next([...currentNotifications]);
          }
          // Update unread count
          this.updateUnreadCount();
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
            read: true
          }));
          this.notificationsSubject.next(updatedNotifications);
          this.unreadCountSubject.next(0);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  createNotification(notificationData: CreateNotificationRequest): Observable<Notification> {
    return this.http.post<ApiResponse<Notification>>(API_ENDPOINTS.NOTIFICATIONS.BASE, notificationData)
      .pipe(
        map(response => response.data!),
        tap(notification => {
          const appNotification = this.convertToAppNotification(notification);
          const currentNotifications = this.notificationsSubject.value;
          this.notificationsSubject.next([appNotification, ...currentNotifications]);
          this.updateUnreadCount();
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // FIXED: Method that components are calling
  deleteNotification(id: number): Observable<void> {
    return this.http.delete<ApiResponse>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/${id}`)
      .pipe(
        map(() => void 0), // Return void as expected by components
        tap(() => {
          const currentNotifications = this.notificationsSubject.value;
          const filteredNotifications = currentNotifications.filter(notif => notif.id !== id);
          this.notificationsSubject.next(filteredNotifications);
          this.updateUnreadCount();
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

  // Utility methods
  getUnreadNotifications(): Observable<AppNotification[]> {
    return this.getNotifications(true);
  }

  getNotificationsByType(type: string): Observable<AppNotification[]> {
    return this.getNotificationsWithFilters({ type })
      .pipe(
        map(response => response.data.map(this.convertToAppNotification))
      );
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(notif => !notif.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // FIXED: Convert API Notification to AppNotification format
  private convertToAppNotification(notification: Notification): AppNotification {
    return {
      id: notification.id,
      message: notification.message,
      read: notification.is_read,
      createdAt: new Date(notification.created_at),
      type: notification.type,
      title: notification.title,
      user_id: notification.user?.id,
      action_url: notification.action_url
    };
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