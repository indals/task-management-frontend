// Add this to your app.component.ts for better responsive handling

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { AuthService } from './core/services/auth.service';
import { LoadingService } from './core/interceptors/loading.interceptor';
import { EnumService } from './core/services/enum.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  title = 'Task Management System';
  isAuthenticated = false;
  isLoading = false;
  showSidebar = true;
  sidebarCollapsed = false;

  constructor(
    private authService: AuthService,
    private loadingService: LoadingService,
    private enumService: EnumService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeApp();
    this.setupSubscriptions();
    this.initializeSidebarState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔧 NEW: Handle window resize for responsive behavior
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const target = event.target as Window;
    const isMobile = target.innerWidth <= 768;
    
    // Auto-collapse sidebar on mobile, expand on desktop
    if (isMobile && !this.sidebarCollapsed) {
      this.sidebarCollapsed = true;
      console.log('Auto-collapsed sidebar for mobile view');
    } else if (!isMobile && this.sidebarCollapsed && target.innerWidth > 1024) {
      // Auto-expand on large screens (optional behavior)
      // this.sidebarCollapsed = false;
      // console.log('Auto-expanded sidebar for desktop view');
    }
  }

  private initializeApp(): void {
    // Initialize enum service (loads all dropdown data)
    this.enumService.loadAllEnums().subscribe({
      next: (enums) => {
        console.log('✅ Enums loaded successfully');
      },
      error: (error) => {
        console.error('❌ Failed to load enums:', error);
      }
    });

    // Start notification polling for authenticated users
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        if (isAuth) {
          this.notificationService.startPolling();
        }
      });
  }

  private setupSubscriptions(): void {
    // Authentication state
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        this.isAuthenticated = isAuthenticated;
        this.updateSidebarVisibility();
      });

    // Loading state
    this.loadingService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isLoading => {
        this.isLoading = isLoading;
      });

    // Router events for sidebar visibility
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateSidebarVisibility(event.url);
      });
  }

  // 🔧 ENHANCED: Better initialization with saved state
  private initializeSidebarState(): void {
    // Check if user has a saved preference
    const savedState = localStorage.getItem('sidebar-collapsed');
    
    if (savedState !== null) {
      this.sidebarCollapsed = JSON.parse(savedState);
    } else {
      // Default: collapse on mobile, expand on desktop
      this.sidebarCollapsed = window.innerWidth <= 768;
    }
    
    console.log('Initialized sidebar state:', { 
      collapsed: this.sidebarCollapsed, 
      screenWidth: window.innerWidth 
    });
  }

  private updateSidebarVisibility(url?: string): void {
    const currentUrl = url || this.router.url;
    
    // Hide sidebar on auth pages and access denied page
    const hideSidebarRoutes = ['/auth', '/access-denied'];
    // this.showSidebar = this.isAuthenticated && 
    //                  !hideSidebarRoutes.some(route => currentUrl.startsWith(route));
    this.showSidebar = true;
  }

  // 🔧 ENHANCED: Save sidebar state and handle toggle
  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
    
    // Save user preference
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
    
    console.log('App component: Sidebar toggled, collapsed:', collapsed);
  }

  // Manual sidebar toggle (if needed)
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    
    // Save user preference
    localStorage.setItem('sidebar-collapsed', JSON.stringify(this.sidebarCollapsed));
    
    console.log('App component: Sidebar manually toggled, collapsed:', this.sidebarCollapsed);
  }

  // 🔧 NEW: Helper method to get current screen size info
  getScreenInfo(): { isMobile: boolean; isTablet: boolean; isDesktop: boolean } {
    const width = window.innerWidth;
    return {
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024,
      isDesktop: width > 1024
    };
  }
}