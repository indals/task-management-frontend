// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';

// Updated interfaces to match API
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export interface TaskSummary {
  id: number;
  title: string;
}

export interface AppNotification {
  id: number;
  user_id: number;
  task_id: number;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  user: User;
  task: TaskSummary;
  // For backward compatibility with existing frontend code
  createdAt?: Date;
  type?: 'info' | 'warning' | 'success' | 'error';
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // private apiUrl = `${environment.apiUrl}/api/notifications`;
  private apiUrl = 'http://127.0.0.1:5000/api/notifications';

  constructor(private http: HttpClient) { }

  // Get user notifications
  getNotifications(unreadOnly?: boolean): Observable<AppNotification[]> {
    let params = new HttpParams();
    if (unreadOnly) {
      params = params.set('unread_only', 'true');
    }
    
    return this.http.get<AppNotification[]>(this.apiUrl, { params });
  }

  // Get count of unread notifications
  getUnreadCount(): Observable<number> {
    return new Observable(observer => {
      this.getNotifications(true).subscribe(
        notifications => observer.next(notifications.length),
        error => observer.error(error)
      );
    });
  }

  // Mark specific notification as read
  markAsRead(id: string | number): Observable<AppNotification> {
    return this.http.post<AppNotification>(`${this.apiUrl}/${id}/read`, {});
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<{ message: string; updated_count: number }> {
    return this.http.post<{ message: string; updated_count: number }>(`${this.apiUrl}/read-all`, {});
  }

  // Delete specific notification
  deleteNotification(id: string | number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}