import { Component, OnInit, OnDestroy } from '@angular/core';
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private updateSidebarVisibility(url?: string): void {
    const currentUrl = url || this.router.url;
    
    // Hide sidebar on auth pages and access denied page
    const hideSidebarRoutes = ['/auth', '/access-denied'];
    // this.showSidebar = this.isAuthenticated && 
    //                  !hideSidebarRoutes.some(route => currentUrl.startsWith(route));
    this.showSidebar = true;
  }

  onSidebarToggle(): void {
    // This method can be called from child components if needed
    this.showSidebar = !this.showSidebar;
  }
}