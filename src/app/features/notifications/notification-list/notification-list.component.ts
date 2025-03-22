import { Component, OnInit } from '@angular/core';
import { NotificationService, AppNotification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  notifications: AppNotification[] = [];
  isLoading = false;
  errorMessage = '';
  showUnreadOnly = false;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(unreadOnly = false): void {
    this.isLoading = true;
    this.showUnreadOnly = unreadOnly;
    
    this.notificationService.getNotifications(unreadOnly).subscribe({
      next: (data) => {
        this.notifications = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load notifications';
        this.isLoading = false;
        console.error(error);
      }
    });
  }

  markAsRead(notification: AppNotification): void {
    if (notification.read) return;
    
    this.notificationService.markAsRead(notification.id).subscribe({
      next: (updatedNotification) => {
        const index = this.notifications.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          this.notifications[index] = updatedNotification;
        }
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to mark notification as read';
        console.error(error);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to mark all notifications as read';
        console.error(error);
      }
    });
  }

  deleteNotification(id: string): void {
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to delete notification';
        console.error(error);
      }
    });
  }
}