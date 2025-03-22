import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

interface Notification {
  id: number;
  user_id: number;
  task_id: number;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  showAll = true; // Filter state: true for all notifications, false for unread only

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    const unreadOnly = !this.showAll;
    
    this.notificationService.getNotifications(unreadOnly)
      .subscribe({
        next: (data) => {
          this.notifications = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching notifications:', error);
          this.loading = false;
        }
      });
  }

  markAsRead(notification: Notification): void {
    if (notification.read) {
      return;
    }

    this.notificationService.markAsRead(notification.id)
      .subscribe({
        next: (updatedNotification) => {
          const index = this.notifications.findIndex(n => n.id === notification.id);
          if (index !== -1) {
            this.notifications[index] = updatedNotification;
          }
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .subscribe({
        next: () => {
          this.notifications.forEach(notification => {
            notification.read = true;
          });
        },
        error: (error) => {
          console.error('Error marking all notifications as read:', error);
        }
      });
  }

  deleteNotification(id: number): void {
    this.notificationService.deleteNotification(id)
      .subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      });
  }

  setFilter(filter: 'all' | 'unread'): void {
    this.showAll = filter === 'all';
    this.loadNotifications();
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some(notification => !notification.read);
  }
}