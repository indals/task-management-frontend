// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// Rename to AppNotification to avoid conflicts with built-in Notification
export interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Mock notifications for development
  private mockNotifications: AppNotification[] = [
    {
      id: '1',
      message: 'New task assigned to you: "Update documentation"',
      read: false,
      createdAt: new Date(),
      link: '/tasks/123',
      type: 'info'
    },
    {
      id: '2',
      message: 'Project "Website Redesign" is due in 2 days',
      read: false,
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      link: '/projects/1',
      type: 'warning'
    },
    {
      id: '3',
      message: 'Your task "Fix login bug" was marked as completed',
      read: true,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      link: '/tasks/456',
      type: 'success'
    }
  ];

  constructor() { }

  // Update to accept optional unreadOnly parameter
  getNotifications(unreadOnly?: boolean): Observable<AppNotification[]> {
    // Filter notifications if unreadOnly is true
    if (unreadOnly) {
      return of(this.mockNotifications.filter(n => !n.read));
    }
    return of(this.mockNotifications);
  }

  getUnreadCount(): Observable<number> {
    // Count unread notifications
    const count = this.mockNotifications.filter(n => !n.read).length;
    return of(count);
  }

  // Update to return the notification object instead of a boolean
  markAsRead(id: string): Observable<AppNotification> {
    // Find and mark the notification as read
    const notification = this.mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      return of(notification);
    }
    throw new Error(`Notification with id ${id} not found`);
  }

  markAllAsRead(): Observable<boolean> {
    // Mark all notifications as read
    this.mockNotifications.forEach(n => n.read = true);
    return of(true);
  }

  // Add missing deleteNotification method
  deleteNotification(id: string): Observable<boolean> {
    const initialLength = this.mockNotifications.length;
    this.mockNotifications = this.mockNotifications.filter(n => n.id !== id);
    const deleted = this.mockNotifications.length < initialLength;
    return of(deleted);
  }
}