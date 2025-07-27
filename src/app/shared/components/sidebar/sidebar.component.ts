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
  
  // 🔧 FIXED: Added missing Reports and corrected permissions
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
        { icon: 'warning', label: 'Overdue', route: '/tasks/overdue', active: false },
        { icon: 'add_task', label: 'Create Task', route: '/tasks/create', active: false }
      ]
    },
    { 
      icon: 'folder', 
      label: 'Projects', 
      route: '/projects',
      active: false,
      badge: null,
      permissions: ['view_all_projects', 'view_team_projects'],
      children: [
        { icon: 'list', label: 'All Projects', route: '/projects', active: false },
        { icon: 'add', label: 'Create Project', route: '/projects/create', active: false }
      ]
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
      permissions: ['view_analytics'] // 🔧 FIXED: Added proper permissions
    },
    // 🔧 ADDED: Missing Reports module
    { 
      icon: 'bar_chart', 
      label: 'Reports', 
      route: '/reports',
      active: false,
      badge: null,
      permissions: ['view_analytics'], // Reports usually need analytics permission
      children: [
        { icon: 'trending_up', label: 'Performance Reports', route: '/reports/performance', active: false },
        { icon: 'pie_chart', label: 'Project Reports', route: '/reports/projects', active: false },
        { icon: 'timeline', label: 'Time Reports', route: '/reports/time', active: false }
      ]
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
    this.setupUserSubscription();
    this.initializeComponent();
    this.setupRouterSubscription();
    this.setupNotificationSubscription();
    
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

  // 🔧 IMPROVED: Better route matching logic
  private updateActiveRoute(url: string): void {
    this.menuItems.forEach(item => {
      // Reset all items to inactive first
      item.active = false;
      if (item.children) {
        item.children.forEach(child => child.active = false);
      }

      // Handle root route
      if (url === '/' && item.route === '/dashboard') {
        item.active = true;
        return;
      }

      // Check exact route match first
      if (url === item.route) {
        item.active = true;
        return;
      }

      // Check if URL starts with route (for nested routes)
      if (url.startsWith(item.route + '/') || url.startsWith(item.route + '?')) {
        item.active = true;
      }

      // Check child routes
      if (item.children) {
        item.children.forEach(child => {
          if (url === child.route || url.startsWith(child.route + '/') || url.startsWith(child.route + '?')) {
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

  // 🔧 IMPROVED: Better permission filtering
  private filterMenuItemsByPermissions(): void {
    console.log('Filtering menu items by permissions for user:', this.currentUser?.role);
    debugger
    if (!this.currentUser) {
      // Hide permission-restricted items if no user
      this.menuItems = this.menuItems.filter(item => !item.permissions || item.permissions.length === 0);
      return;
    }

    // Filter main menu items
    this.menuItems = this.menuItems.filter(item => this.canShowMenuItem(item));
    
    // Filter child menu items
    this.menuItems.forEach(item => {
      if (item.children) {
        item.children = item.children.filter(child => this.canShowMenuItem(child));
      }
    });
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
    if (item.permissions && item.permissions.length > 0 && !this.hasAnyPermission(item.permissions)) {
      return false;
    }

    return true;
  }

  private hasAnyPermission(permissions: string[]): boolean {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return false;

    const userPermissions = this.getUserPermissions(currentUser.role);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  // 🔧 UPDATED: Enhanced permissions with more granular control
  private getUserPermissions(role: string): string[] {
    const rolePermissions: { [key: string]: string[] } = {

      'ADMIN': [
        'view_all_tasks', 'create_task', 'edit_task', 'delete_task', 'assign_task',
        'view_all_projects', 'create_project', 'edit_project', 'delete_project',
        'manage_team', 'view_analytics', 'manage_sprints', 'manage_users',
        'view_team_tasks', 'view_team_projects'
      ],
      'PROJECT_MANAGER': [
        'view_all_tasks', 'create_task', 'edit_task', 'delete_task', 'assign_task',
        'view_all_projects', 'create_project', 'edit_project',
        'view_analytics', 'manage_sprints', 'manage_team',
        'view_team_tasks', 'view_team_projects'
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
    console.log(`Permissions for role ${role}:`, rolePermissions[role]);
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
    console.log('Quick search clicked');
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }
}