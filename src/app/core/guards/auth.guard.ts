// src/app/core/guards/auth.guard.ts - Enhanced version
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  CanActivateChild, 
  CanLoad, 
  Router, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Route, 
  UrlSegment 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url, route);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkAuth(state.url, childRoute);
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    const url = segments.map(segment => segment.path).join('/');
    return this.checkAuth(url);
  }

  private checkAuth(url: string, route?: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        // console.log('Auth Guard Check:', { isAuthenticated, url, route: route?.data });
        
        if (isAuthenticated) {
          // Check for role-based access if specified in route data
          if (route?.data?.['roles']) {
            return this.checkRoleAccess(route.data['roles']);
          }
          
          // Check for permission-based access if specified in route data
          if (route?.data?.['permissions']) {
            return this.checkPermissionAccess(route.data['permissions']);
          }
          
          return true;
        } else {
          // Store the attempted URL for redirecting after login
          this.authService.redirectUrl = url;
          
          // Redirect to login page
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: url }
          });
          
          return false;
        }
      }),
      catchError(error => {
        console.error('Auth Guard Error:', error);
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }

  private checkRoleAccess(allowedRoles: string[]): boolean {
    const currentUser = this.authService.getCurrentUserValue();
    
    if (!currentUser || !currentUser.role) {
      this.redirectToAccessDenied();
      return false;
    }

    if (allowedRoles.includes(currentUser.role)) {
      return true;
    }

    this.redirectToAccessDenied();
    return false;
  }

  private checkPermissionAccess(requiredPermissions: string[]): boolean {
    const currentUser = this.authService.getCurrentUserValue();
    
    if (!currentUser) {
      this.redirectToAccessDenied();
      return false;
    }

    // Get user permissions based on role
    const userPermissions = this.getUserPermissions(currentUser.role);
    
    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (hasAllPermissions) {
      return true;
    }

    this.redirectToAccessDenied();
    return false;
  }

  private getUserPermissions(role: string): string[] {
    // Define permissions for each role - matches your existing structure
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
        'view_assigned_tasks', 'edit_own_tasks',
        'view_project_tasks', 'view_sprints'
      ],
      'QA_ENGINEER': [
        'view_assigned_tasks', 'edit_own_tasks',
        'view_project_tasks', 'view_sprints', 'test_tasks'
      ],
      'DEVOPS_ENGINEER': [
        'view_assigned_tasks', 'edit_own_tasks',
        'view_project_tasks', 'view_sprints', 'deploy_tasks'
      ],
      'UI_UX_DESIGNER': [
        'view_assigned_tasks', 'edit_own_tasks',
        'view_project_tasks', 'view_sprints', 'design_tasks'
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
        'view_team_tasks', 'view_team_projects',
        'view_analytics', 'manage_sprints', 'facilitate_ceremonies'
      ]
    };

    return rolePermissions[role] || [];
  }

  private redirectToAccessDenied(): void {
    this.router.navigate(['/access-denied']);
  }

  // 🔧 ENHANCED: Public utility methods for components
  hasPermission(permission: string): boolean {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return false;

    const userPermissions = this.getUserPermissions(currentUser.role);
    return userPermissions.includes(permission);
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return this.authService.hasAnyRole(roles);
  }

  // 🔧 NEW: Helper methods for UI components
  canAccessDashboard(): boolean {
    return this.authService.isLoggedIn();
  }

  canAccessSidebar(): boolean {
    return this.authService.isLoggedIn();
  }

  canShowUserMenu(): boolean {
    return this.authService.isLoggedIn();
  }

  canAccessAdminFeatures(): boolean {
    return this.hasRole('ADMIN');
  }

  canManageProjects(): boolean {
    return this.hasAnyRole(['ADMIN', 'PROJECT_MANAGER']);
  }

  canManageTeam(): boolean {
    return this.hasAnyRole(['ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']);
  }

  canViewAnalytics(): boolean {
    return this.hasPermission('view_analytics');
  }

  canManageSprints(): boolean {
    return this.hasPermission('manage_sprints');
  }

  canCreateTasks(): boolean {
    return this.hasPermission('create_task');
  }

  canEditAllTasks(): boolean {
    return this.hasPermission('edit_task');
  }

  canDeleteTasks(): boolean {
    return this.hasPermission('delete_task');
  }

  canAssignTasks(): boolean {
    return this.hasPermission('assign_task');
  }
}

// 🔧 NEW: Route data interface with better typing
export interface RouteAuthData {
  roles?: string[];
  permissions?: string[];
  requiresAuth?: boolean;
  allowGuests?: boolean; // For routes that can be accessed by both auth/unauth users
}

// 🔧 NEW: Example route configurations
export const ROUTE_EXAMPLES = {
  // Public routes (no guard needed)
  PUBLIC: [
    { path: 'login', component: 'LoginComponent' },
    { path: 'register', component: 'RegisterComponent' },
    { path: 'forgot-password', component: 'ForgotPasswordComponent' }
  ],

  // Protected routes with basic auth
  AUTHENTICATED: [
    {
      path: 'dashboard',
      component: 'DashboardComponent',
      canActivate: ['AuthGuard'],
      data: { requiresAuth: true }
    }
  ],

  // Role-based protected routes
  ROLE_PROTECTED: [
    {
      path: 'admin',
      component: 'AdminComponent',
      canActivate: ['AuthGuard'],
      data: { roles: ['ADMIN'] }
    },
    {
      path: 'projects/manage',
      component: 'ProjectManagementComponent',
      canActivate: ['AuthGuard'],
      data: { roles: ['ADMIN', 'PROJECT_MANAGER'] }
    }
  ],

  // Permission-based protected routes
  PERMISSION_PROTECTED: [
    {
      path: 'projects',
      component: 'ProjectsComponent',
      canActivate: ['AuthGuard'],
      data: { permissions: ['view_all_projects'] }
    },
    {
      path: 'analytics',
      component: 'AnalyticsComponent',
      canActivate: ['AuthGuard'],
      data: { permissions: ['view_analytics'] }
    }
  ]
};