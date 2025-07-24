// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { map, catchError, takeUntil } from 'rxjs/operators';

import { Notification } from '../models/notification.model';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  persistent?: boolean;
  actionText?: string;
  actionCallback?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private destroy$ = new Subject<void>();
  
  // Real-time notifications polling interval (30 seconds)
  private readonly POLLING_INTERVAL = 30000;
  
  // In-app notification queue
  private inAppNotifications: NotificationOptions[] = [];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    this.startPolling();
  }

  // Getters for reactive data
  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  // Fetch notifications from API
  fetchNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST)
      .pipe(
        map(notifications => {
          this.notifications$.next(notifications);
          this.updateUnreadCount(notifications);
          return notifications;
        }),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Create a new notification
  createNotification(notification: Partial<Notification>): Observable<Notification> {
    return this.http.post<Notification>(API_ENDPOINTS.NOTIFICATIONS.CREATE, notification)
      .pipe(
        map(newNotification => {
          const currentNotifications = this.notifications$.value;
          this.notifications$.next([newNotification, ...currentNotifications]);
          this.updateUnreadCount([newNotification, ...currentNotifications]);
          return newNotification;
        }),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Mark notification as read
  markAsRead(notificationId: number): Observable<Notification> {
    return this.http.put<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', notificationId.toString()),
      {}
    ).pipe(
      map(updatedNotification => {
        const currentNotifications = this.notifications$.value;
        const index = currentNotifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
          currentNotifications[index] = { ...updatedNotification, read: true };
          this.notifications$.next([...currentNotifications]);
          this.updateUnreadCount(currentNotifications);
        }
        return updatedNotification;
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {})
      .pipe(
        map(response => {
          const currentNotifications = this.notifications$.value.map(n => ({
            ...n,
            read: true
          }));
          this.notifications$.next(currentNotifications);
          this.unreadCount$.next(0);
          return response;
        }),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      API_ENDPOINTS.NOTIFICATIONS.DELETE.replace(':id', notificationId.toString())
    ).pipe(
      map(response => {
        const currentNotifications = this.notifications$.value;
        const filteredNotifications = currentNotifications.filter(n => n.id !== notificationId);
        this.notifications$.next(filteredNotifications);
        this.updateUnreadCount(filteredNotifications);
        return response;
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Show in-app notification (simple console log for now)
  showNotification(options: NotificationOptions): void {
    console.log(`[${options.type?.toUpperCase() || 'INFO'}] ${options.message}`);
    
    // Store in queue for potential replay
    this.inAppNotifications.push(options);
    
    // Limit queue size
    if (this.inAppNotifications.length > 10) {
      this.inAppNotifications = this.inAppNotifications.slice(-10);
    }
  }

  // Convenience methods for different notification types
  showSuccess(message: string, actionText?: string, actionCallback?: () => void): void {
    this.showNotification({
      message,
      type: 'success',
      actionText,
      actionCallback
    });
  }

  showError(message: string, persistent: boolean = false): void {
    this.showNotification({
      message,
      type: 'error',
      persistent,
      duration: persistent ? 0 : 8000
    });
  }

  showWarning(message: string, actionText?: string, actionCallback?: () => void): void {
    this.showNotification({
      message,
      type: 'warning',
      actionText,
      actionCallback
    });
  }

  showInfo(message: string): void {
    this.showNotification({
      message,
      type: 'info'
    });
  }

  // Send notification to specific user (for managers/admins)
  sendNotificationToUser(userId: number, notification: Partial<Notification>): Observable<Notification> {
    return this.createNotification({
      ...notification,
      user_id: userId
    });
  }

  // Send notification to multiple users
  sendBulkNotification(userIds: number[], notification: Partial<Notification>): Observable<Notification[]> {
    const notifications$ = userIds.map(userId => 
      this.sendNotificationToUser(userId, notification)
    );
    
    // Return combined observable
    return new Observable(observer => {
      Promise.all(notifications$.map(obs => obs.toPromise()))
        .then(results => {
          observer.next(results as Notification[]);
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  // Notify about task assignment
  notifyTaskAssignment(taskId: number, taskTitle: string, assigneeId: number): void {
    this.sendNotificationToUser(assigneeId, {
      title: 'New Task Assigned',
      message: `You have been assigned to task: ${taskTitle}`,
      type: 'task_assignment',
      related_id: taskId,
      read: false
    }).subscribe({
      next: () => console.log('Task assignment notification sent'),
      error: (error) => console.error('Error sending task assignment notification:', error)
    });
  }

  // Notify about task status change
  notifyTaskStatusChange(taskId: number, taskTitle: string, newStatus: string, managerIds: number[]): void {
    const message = `Task "${taskTitle}" status changed to ${newStatus}`;
    
    this.sendBulkNotification(managerIds, {
      title: 'Task Status Update',
      message,
      type: 'task_update',
      related_id: taskId,
      read: false
    }).subscribe({
      next: () => console.log('Task status change notifications sent'),
      error: (error) => console.error('Error sending task status notifications:', error)
    });
  }

  // Notify about task deadline approaching
  notifyTaskDeadlineApproaching(taskId: number, taskTitle: string, userIds: number[]): void {
    const message = `Task "${taskTitle}" is due soon`;
    
    this.sendBulkNotification(userIds, {
      title: 'Task Deadline Reminder',
      message,
      type: 'deadline_reminder',
      related_id: taskId,
      read: false
    }).subscribe({
      next: () => console.log('Deadline reminder notifications sent'),
      error: (error) => console.error('Error sending deadline notifications:', error)
    });
  }

  // Get recent in-app notifications
  getRecentInAppNotifications(): NotificationOptions[] {
    return this.inAppNotifications.slice(-5);
  }

  // Private methods
  private startPolling(): void {
    // Poll for new notifications every 30 seconds
    timer(0, this.POLLING_INTERVAL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.fetchNotifications().subscribe({
          error: (error) => console.error('Error polling notifications:', error)
        });
      });
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCount$.next(unreadCount);
  }

  // Cleanup
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}