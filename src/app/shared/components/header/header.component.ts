import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  unreadNotificationCount = 0;
  showNotificationPanel = false;
  searchQuery = '';

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Notification count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadNotificationCount = count;
      });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Navigate to search results or perform search
      console.log('Searching for:', this.searchQuery);
      // this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  onNotificationClick(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
  }

  onProfileClick(): void {
    // Navigate to profile or show profile menu
    console.log('Profile clicked');
    // this.router.navigate(['/profile']);
  }

  onSettingsClick(): void {
    // Navigate to settings
    console.log('Settings clicked');
    // this.router.navigate(['/settings']);
  }

  onLogout(): void {
    this.authService.logout();
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) return 'U';
    
    const names = this.currentUser.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('All notifications marked as read');
      },
      error: (error) => {
        console.error('Error marking notifications as read:', error);
      }
    });
  }

  closeNotificationPanel(): void {
    this.showNotificationPanel = false;
  }
}