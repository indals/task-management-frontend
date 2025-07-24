// src/app/shared/components/sidebar/sidebar.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, User, ProjectService, Project } from '../../../core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Input() mobile = false;
  @Input() open = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  currentUser: User | null = null;
  recentProjects: Project[] = [];

  menuItems = [
    { 
      icon: 'dashboard', 
      label: 'Dashboard', 
      route: '/dashboard',
      active: false
    },
    { 
      icon: 'assignment', 
      label: 'Tasks', 
      route: '/tasks',
      active: false
    },
    { 
      icon: 'folder', 
      label: 'Projects', 
      route: '/projects',
      active: false
    },
    { 
      icon: 'calendar_today', 
      label: 'Calendar', 
      route: '/calendar',
      active: false
    },
    { 
      icon: 'notifications', 
      label: 'Notifications', 
      route: '/notifications',
      active: false
    },
    { 
      icon: 'assessment', 
      label: 'Reports', 
      route: '/reports',
      active: false
    }
  ];

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Load recent projects if user is logged in
    if (this.authService.isLoggedIn()) {
      this.loadRecentProjects();
    }

    // Set active menu item based on current route
    this.setActiveMenuItem();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToggle(): void {
    this.toggleSidebar.emit();
  }

  onClose(): void {
    this.closeSidebar.emit();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    if (this.mobile) {
      this.onClose();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadRecentProjects(): void {
    this.projectService.getRecentProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.recentProjects = projects.slice(0, 3); // Show only 3 recent projects
        },
        error: (error) => {
          console.error('Error loading recent projects:', error);
        }
      });
  }

  private setActiveMenuItem(): void {
    const currentUrl = this.router.url;
    this.menuItems.forEach(item => {
      item.active = currentUrl.startsWith(item.route);
    });
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'User';
    return this.currentUser.name || this.currentUser.username || 'User';
  }
}