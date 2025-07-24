import { Component, OnInit } from '@angular/core';
import { NotificationService, AppNotification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {
  notifications: AppNotification[] = [];
  isLoading = false; // or loading:boolean = false; whichever you prefer.
  errorMessage = '';
  showAll = true; // Initialize to 'all'
  filter: 'all' | 'unread' = 'all';

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications(this.filter === 'unread').subscribe({
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

deleteNotification(id: number): void {  // string ki jagah number
  this.notificationService.deleteNotification(id).subscribe({
    next: () => {
      this.notifications = this.notifications.filter(n => n.id !== id);  // String() remove karo
    },
    error: (error: any) => {
      this.errorMessage = 'Failed to delete notification';
      console.error(error);
    }
  });
}

  setFilter(filter: 'all' | 'unread'): void {
    this.filter = filter;
    this.showAll = filter === 'all';
    this.loadNotifications(); // Reload notifications with the new filter
  }

  get hasUnreadNotifications(): boolean {
    return this.notifications.some(notification => !notification.read);
  }
}