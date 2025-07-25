// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { map, catchError, tap, switchMap, startWith } from 'rxjs/operators';

import { API_ENDPOINTS, APP_CONFIG } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';
import { 
  Notification, 
  NotificationFilters,
  NotificationStats,
  BulkNotificationAction,
  NotificationResponse,
  NotificationListResponse,
  NotificationStatsResponse,
  UnreadCountResponse,
  formatNotificationTime,
  groupNotificationsByDate,
  getNotificationPriority
} from '../models/notification.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private pollingInterval = 30000; // 30 seconds

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  // Real-time polling for new notifications
  public notificationPolling$ = interval(this.pollingInterval).pipe(
    startWith(0),
    switchMap(() => this.getUnreadCount()),
    tap(response => this.unreadCountSubject.next(response.data.unread_count)),
    catchError(error => {
      console.warn('Failed to poll notifications:', error);
      return [];
    })
  );

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    // Start polling for notifications
    this.startNotificationPolling();
  }

  // Notification CRUD Operations
  getAllNotifications(filters?: NotificationFilters): Observable<PaginatedResponse<Notification>> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v.toString()));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<NotificationListResponse>(API_ENDPOINTS.NOTIFICATIONS.BASE, { params })
      .pipe(
        tap(response => {
          this.notificationsSubject.next(response.data);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.errorHandler.handleError(error);
        })
      );
  }

  getNotificationById(id: number): Observable<Notification> {
    return this.http.get<NotificationResponse>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id))
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id))
      .pipe(
        map(() => void 0),
        tap(() => {
          const currentNotifications = this.notificationsSubject.value;
          const filteredNotifications = currentNotifications.filter(notification => notification.id !== id);
          this.notificationsSubject.next(filteredNotifications);
          this.updateUnreadCount();
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  // Notification Status Management
  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.post<NotificationResponse>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId), {})
      .pipe(
        map(response => response.data),
        tap(updatedNotification => {
          this.updateNotificationInState(updatedNotification);
          this.updateUnreadCount();
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  markAllAsRead(): Observable<{ updated_count: number }> {
    return this.http.post<ApiResponse<{ updated_count: number }>>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {})
      .pipe(
        map(response => response.data),
        tap(() => {
          // Mark all current notifications as read
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => ({
            ...notification,
            read: true,
            read_at: new Date().toISOString()
          }));
          this.notificationsSubject.next(updatedNotifications);
          this.unreadCountSubject.next(0);
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  // Specialized Queries
  getUnreadNotifications(): Observable<PaginatedResponse<Notification>> {
    const filters: NotificationFilters = { unread_only: true };
    return this.getAllNotifications(filters);
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT)
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  getNotificationsByType(type: string): Observable<PaginatedResponse<Notification>> {
    const filters: NotificationFilters = { type: [type as any] };
    return this.getAllNotifications(filters);
  }

  getNotificationsByProject(projectId: number): Observable<PaginatedResponse<Notification>> {
    const filters: NotificationFilters = { project_id: [projectId] };
    return this.getAllNotifications(filters);
  }

  // Bulk Operations
  bulkMarkAsRead(notificationIds: number[]): Observable<void> {
    const action: BulkNotificationAction = {
      notification_ids: notificationIds,
      action: 'mark_read'
    };

    return this.http.post<ApiResponse<null>>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/bulk`, action)
      .pipe(
        map(() => void 0),
        tap(() => {
          // Update notifications in state
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => {
            if (notificationIds.includes(notification.id)) {
              return {
                ...notification,
                read: true,
                read_at: new Date().toISOString()
              };
            }
            return notification;
          });
          this.notificationsSubject.next(updatedNotifications);
          this.updateUnreadCount();
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  bulkDelete(notificationIds: number[]): Observable<void> {
    const action: BulkNotificationAction = {
      notification_ids: notificationIds,
      action: 'delete'
    };

    return this.http.post<ApiResponse<null>>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/bulk`, action)
      .pipe(
        map(() => void 0),
        tap(() => {
          const currentNotifications = this.notificationsSubject.value;
          const filteredNotifications = currentNotifications.filter(
            notification => !notificationIds.includes(notification.id)
          );
          this.notificationsSubject.next(filteredNotifications);
          this.updateUnreadCount();
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  // Statistics & Analytics
  getNotificationStats(): Observable<NotificationStats> {
    return this.http.get<ApiResponse<NotificationStats>>(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/stats`)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Real-time Features
  startNotificationPolling(): void {
    this.notificationPolling$.subscribe();
  }

  stopNotificationPolling(): void {
    // This would be implemented with a takeUntil pattern in a real application
    // For now, we'll keep it simple
  }

  // Browser Notifications (if permission granted)
  requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return Promise.resolve('denied');
    }
    
    return Notification.requestPermission();
  }

  showBrowserNotification(notification: Notification): void {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png',
        tag: notification.id.toString(),
        requireInteraction: getNotificationPriority(notification.type) === 'critical'
      });

      browserNotification.onclick = () => {
        // Handle notification click - could navigate to related task/project
        window.focus();
        browserNotification.close();
      };

      // Auto-close after timeout unless it's critical
      if (getNotificationPriority(notification.type) !== 'critical') {
        setTimeout(() => browserNotification.close(), APP_CONFIG.NOTIFICATION_TIMEOUT);
      }
    }
  }

  // Utility Methods
  formatNotificationTime(createdAt: string): string {
    return formatNotificationTime(createdAt);
  }

  groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
    return groupNotificationsByDate(notifications);
  }

  getNotificationPriority(type: string): 'critical' | 'high' | 'medium' | 'low' {
    return getNotificationPriority(type as any);
  }

  // Filter and Search
  filterNotifications(notifications: Notification[], searchTerm: string): Notification[] {
    if (!searchTerm.trim()) return notifications;
    
    const term = searchTerm.toLowerCase();
    return notifications.filter(notification =>
      notification.title.toLowerCase().includes(term) ||
      notification.message.toLowerCase().includes(term) ||
      notification.related_user?.name.toLowerCase().includes(term)
    );
  }

  sortNotifications(notifications: Notification[], sortBy: 'date' | 'priority' | 'type' = 'date'): Notification[] {
    return [...notifications].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[this.getNotificationPriority(a.type)];
          const bPriority = priorityOrder[this.getNotificationPriority(b.type)];
          return bPriority - aPriority;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  }

  // State Management
  private updateNotificationInState(updatedNotification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    const index = currentNotifications.findIndex(notification => notification.id === updatedNotification.id);
    
    if (index !== -1) {
      currentNotifications[index] = updatedNotification;
      this.notificationsSubject.next([...currentNotifications]);
    }
  }

  private updateUnreadCount(): void {
    const currentNotifications = this.notificationsSubject.value;
    const unreadCount = currentNotifications.filter(notification => !notification.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  refreshNotifications(filters?: NotificationFilters): Observable<PaginatedResponse<Notification>> {
    return this.getAllNotifications(filters);
  }

  // Getters for current state
  getCurrentNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }
}