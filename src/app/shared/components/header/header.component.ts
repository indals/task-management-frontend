import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  notificationCount = 0;
  isDropdownOpen = false;
  isMobile = false;
  sidebarCollapsed = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private layoutService: LayoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    // Get notification count and subscribe to updates
    this.subscriptions.push(
      this.notificationService.getUnreadCount().subscribe(count => {
        this.notificationCount = count;
      })
    );
    
    // Subscribe to sidebar state
    this.subscriptions.push(
      this.layoutService.sidebarCollapsed$.subscribe((collapsed: boolean) => {
        this.sidebarCollapsed = collapsed;
      })
    );
    
    // Subscribe to mobile state
    this.subscriptions.push(
      this.layoutService.isMobile$.subscribe((mobile: boolean) => {
        this.isMobile = mobile;
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.isDropdownOpen = false;
  }

  navigateToProfile(): void {
    this.router.navigate(['/auth/profile']);
    this.isDropdownOpen = false;
  }
  
  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.isDropdownOpen = false;
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}