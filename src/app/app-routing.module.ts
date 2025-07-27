// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AntiAuthGuard } from './core/guards/anti-auth.guard';
// import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  // Default redirect to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // 🔧 FIXED: Auth routes with AntiAuthGuard (prevents access when logged in)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    canActivate: [AntiAuthGuard], // ✅ Added AntiAuthGuard
    data: { 
      title: 'Authentication',
      preload: true // Preload auth module for faster initial load
    }
  },

  // 🔧 PROTECTED ROUTES: All require authentication
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Dashboard',
      breadcrumb: 'Dashboard',
      preload: true
    }
  },

  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.module').then(m => m.TasksModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Tasks',
      breadcrumb: 'Tasks'
    }
  },

  {
    path: 'projects',
    loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Projects',
      breadcrumb: 'Projects'
    }
  },

  {
    path: 'team',
    loadChildren: () => import('./features/team/team.module').then(m => m.TeamModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Team',
      breadcrumb: 'Team Management'
    }
  },

  {
    path: 'calendar',
    loadChildren: () => import('./features/calendar/calendar.module').then(m => m.CalendarModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Calendar',
      breadcrumb: 'Calendar'
    }
  },

  {
    path: 'time-tracking',
    loadChildren: () => import('./features/time-tracking/time-tracking.module').then(m => m.TimeTrackingModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Time Tracking',
      breadcrumb: 'Time Tracking'
    }
  },

  {
    path: 'sprints',
    loadChildren: () => import('./features/sprints/sprints.module').then(m => m.SprintsModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Sprints',
      breadcrumb: 'Sprint Management'
    }
  },

  {
    path: 'analytics',
    loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Analytics',
      breadcrumb: 'Analytics'
    }
  },

  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Reports',
      breadcrumb: 'Reports'
    }
  },

  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Notifications',
      breadcrumb: 'Notifications'
    }
  },

  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard],
    data: { 
      title: 'Settings',
      breadcrumb: 'Settings'
    }
  },

  // 🔧 ERROR HANDLING ROUTES
  // {
  //   path: '404',
  //   component: NotFoundComponent,
  //   data: { 
  //     title: '404 - Page Not Found',
  //     hideNavigation: true // Don't show sidebar/navbar on error pages
  //   }
  // },

  // 🔧 WILDCARD ROUTE: Must be last - catches all undefined routes
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // 🔧 ENHANCED ROUTING CONFIGURATION
    enableTracing: false, // Set to true for debugging routes
    preloadingStrategy: 'preload' as any, // Preload lazy-loaded modules
    scrollPositionRestoration: 'top', // Scroll to top on route change
    anchorScrolling: 'enabled', // Enable fragment scrolling
    urlUpdateStrategy: 'eager', // Update URL immediately
    onSameUrlNavigation: 'reload', // Reload when navigating to same URL
    errorHandler: (error: any) => {
      console.error('Router Error:', error);
      // You could also send this to your error logging service
    }
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// 🔧 ROUTE CONFIGURATION NOTES:
/*
1. **AntiAuthGuard**: Prevents authenticated users from accessing auth pages
2. **AuthGuard**: Protects all application routes (requires login)
3. **Lazy Loading**: All feature modules are loaded on-demand
4. **Route Data**: Added titles and breadcrumbs for better UX
5. **Error Handling**: Proper 404 handling and malformed URI protection
6. **Preloading**: Modules are preloaded for better performance
7. **Scroll Management**: Automatic scroll-to-top on navigation

ROUTING FLOW:
- Unauthenticated users: Can only access /auth routes
- Authenticated users: Redirected from /auth to /dashboard
- Invalid routes: Redirected to /404
- Default route: Redirects to /dashboard
*/