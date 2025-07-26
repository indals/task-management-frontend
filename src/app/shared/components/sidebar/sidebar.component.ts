import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active: boolean;
  badge?: string | null;
  badgeCount?: number;
  roles?: string[];
  permissions?: string[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ height: '*', opacity: 1 })),
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('300ms ease-in-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('300ms ease-in-out', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  unreadNotificationCount = 0;
  isCollapsed = false;
  
  menuItems: MenuItem[] = [
    { 
      icon: 'dashboard', 
      label: 'Dashboard', 
      route: '/dashboard',
      active: false,
      badge: null
    },
    { 
      icon: 'assignment', 
      label: 'Tasks', 
      route: '/tasks',
      active: false,
      badge: null,
      children: [
        { icon: 'list', label: 'All Tasks', route: '/tasks', active: false },
        { icon: 'person', label: 'My Tasks', route: '/tasks/my-tasks', active: false },
        { icon: 'warning', label: 'Overdue', route: '/tasks/overdue', active: false }
      ]
    },
    { 
      icon: 'folder', 
      label: 'Projects', 
      route: '/projects',
      active: false,
      badge: null,
      permissions: ['view_all_projects', 'view_team_projects']
    },
    { 
      icon: 'track_changes', 
      label: 'Sprints', 
      route: '/sprints',
      active: false,
      badge: null,
      permissions: ['manage_sprints', 'view_sprints']
    },
    { 
      icon: 'group', 
      label: 'Team', 
      route: '/team',
      active: false,
      badge: null,
      permissions: ['manage_team', 'view_team_tasks']
    },
    { 
      icon: 'schedule', 
      label: 'Time Tracking', 
      route: '/time-tracking',
      active: false,
      badge: null
    },
    { 
      icon: 'calendar_today', 
      label: 'Calendar', 
      route: '/calendar',
      active: false,
      badge: null
    },
    { 
      icon: 'notifications', 
      label: 'Notifications', 
      route: '/notifications',
      active: false,
      badge: 'unreadCount'
    },
    { 
      icon: 'assessment', 
      label: 'Analytics', 
      route: '/analytics',
      active: false,
      badge: null,
      permissions: ['view_analytics']
    },
    { 
      icon: 'settings', 
      label: 'Settings', 
      route: '/settings',
      active: false,
      badge: null
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.setupRouterSubscription();
    this.setupNotificationSubscription();
    this.setupUserSubscription();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    // Set initial active route
    this.updateActiveRoute(this.router.url);
    
    // Filter menu items based on user permissions
    this.filterMenuItemsByPermissions();
  }

  private setupRouterSubscription(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateActiveRoute(event.url);
      });
  }

  private setupNotificationSubscription(): void {
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadNotificationCount = count;
        this.updateNotificationBadge();
      });
  }

  private setupUserSubscription(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.filterMenuItemsByPermissions();
      });
  }

  private updateActiveRoute(url: string): void {
    this.menuItems.forEach(item => {
      // Reset all items to inactive first
      item.active = false;
      if (item.children) {
        item.children.forEach(child => child.active = false);
      }

      // Check main route
      if (url.startsWith(item.route) && item.route !== '/') {
        item.active = true;
      } else if (url === '/' && item.route === '/dashboard') {
        item.active = true;
      }

      // Check child routes
      if (item.children) {
        item.children.forEach(child => {
          if (url.startsWith(child.route) && child.route !== '/') {
            child.active = true;
            item.active = true; // Also mark parent as active
          }
        });
      }
    });
  }

  private updateNotificationBadge(): void {
    const notificationItem = this.menuItems.find(item => item.route === '/notifications');
    if (notificationItem) {
      notificationItem.badgeCount = this.unreadNotificationCount;
    }
  }

  private filterMenuItemsByPermissions(): void {
    if (!this.currentUser) return;

    this.menuItems = this.menuItems.filter(item => this.canShowMenuItem(item));
  }

  private canShowMenuItem(item: MenuItem): boolean {
    // If no permissions or roles specified, show the item
    if (!item.permissions && !item.roles) {
      return true;
    }

    // Check roles
    if (item.roles && !this.authService.hasAnyRole(item.roles)) {
      return false;
    }

    // Check permissions
    if (item.permissions && !this.hasAnyPermission(item.permissions)) {
      return false;
    }

    return true;
  }

  private hasAnyPermission(permissions: string[]): boolean {
    // This would typically come from the AuthGuard or a permission service
    // For now, we'll use a simplified role-based check
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return false;

    const userPermissions = this.getUserPermissions(currentUser.role);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  private getUserPermissions(role: string): string[] {
    // This should match the permissions in AuthGuard
    const rolePermissions: { [key: string]: string[] } = {
      'ADMIN': [
        'view_all_tasks', 'create_task', 'edit_task', 'delete_task', 'assign_task',
        'view_all_projects', 'create_project', 'edit_project', 'delete_project',
        'manage_team', 'view_analytics', 'manage_sprints', 'manage_users'
      ],
      'PROJECT_MANAGER': [
        'view_all_tasks', 'create_task', 'edit_task', 'delete_task', 'assign_task',
        'view_all_projects', 'create_project', 'edit_project',
        'view_analytics', 'manage_sprints', 'manage_team'
      ],
      'TEAM_LEAD': [
        'view_team_tasks', 'create_task', 'edit_task', 'assign_task',
        'view_team_projects', 'view_analytics', 'manage_sprints'
      ],
      'SENIOR_DEVELOPER': [
        'view_assigned_tasks', 'create_task', 'edit_own_tasks',
        'view_project_tasks', 'view_sprints'
      ],
      'DEVELOPER': [
        'view_assigned_tasks', 'edit_own_tasks', 'view_project_tasks', 'view_sprints'
      ],
      'QA_ENGINEER': [
        'view_assigned_tasks', 'edit_own_tasks', 'view_project_tasks', 'view_sprints'
      ],
      'DEVOPS_ENGINEER': [
        'view_assigned_tasks', 'edit_own_tasks', 'view_project_tasks', 'view_sprints'
      ],
      'UI_UX_DESIGNER': [
        'view_assigned_tasks', 'edit_own_tasks', 'view_project_tasks', 'view_sprints'
      ],
      'BUSINESS_ANALYST': [
        'view_assigned_tasks', 'create_task', 'edit_own_tasks',
        'view_project_tasks', 'view_analytics'
      ],
      'PRODUCT_OWNER': [
        'view_all_tasks', 'create_task', 'edit_task',
        'view_all_projects', 'view_analytics', 'manage_sprints'
      ],
      'SCRUM_MASTER': [
        'view_team_tasks', 'view_team_projects', 'view_analytics', 'manage_sprints'
      ]
    };

    return rolePermissions[role] || [];
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      // Toggle child menu
      item.active = !item.active;
    } else {
      this.router.navigate([item.route]);
    }
  }

  onChildMenuClick(parent: MenuItem, child: MenuItem): void {
    this.router.navigate([child.route]);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getNotificationBadgeText(): string {
    return this.unreadNotificationCount > 99 ? '99+' : this.unreadNotificationCount.toString();
  }

  shouldShowBadge(item: MenuItem): boolean {
    return item.badge === 'unreadCount' && this.unreadNotificationCount > 0;
  }

  getUserInitials(): string {
    if (!this.currentUser?.name) return 'U';
    
    const names = this.currentUser.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  getUserRole(): string {
    return this.currentUser?.role?.replace('_', ' ') || 'User';
  }

  onLogout(): void {
    this.authService.logout();
  }

  openQuickSearch(): void {
    // TODO: Implement quick search functionality
    // This could open a dialog or navigate to a search page
    console.log('Quick search clicked');
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }
}