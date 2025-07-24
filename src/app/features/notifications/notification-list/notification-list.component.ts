import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = false;
  filter = 'all'; // 'all' | 'unread'
  showAll = true; // For template compatibility

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.fetchNotifications().subscribe({
      next: (notifications) => {
        this.notifications = this.filterNotifications(notifications);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
      }
    });
  }

  private filterNotifications(notifications: Notification[]): Notification[] {
    if (this.filter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
      },
      error: (error) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      }
    });
  }

  // Template compatibility methods
  setFilter(filter: string): void {
    this.filter = filter;
    this.showAll = filter === 'all';
    this.loadNotifications();
  }

  onFilterChange(filter: string): void {
    this.setFilter(filter);
  }

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(notification => !notification.read);
  }

  getNotificationIcon(type?: string): string {
    switch (type) {
      case 'task_assignment':
        return 'assignment';
      case 'task_update':
        return 'update';
      case 'deadline_reminder':
        return 'schedule';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}