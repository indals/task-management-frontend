// src/app/app-routing.module.ts - Enhanced with proper auth guards
import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

// Import guards
import { AuthGuard } from './core/guards/auth.guard';

// ✅ Exported routes for use in app.config.ts
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    data: { requiresAuth: true }
  },
  {
    path: 'tasks',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/tasks/tasks.module').then(m => m.TasksModule),
    data: { requiresAuth: true }
  },
  {
    path: 'projects',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule),
    data: {
      requiresAuth: true,
      permissions: ['view_all_projects', 'view_team_projects']
    }
  },
  {
    path: 'sprints',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/sprints/sprints.module').then(m => m.SprintsModule),
    data: {
      requiresAuth: true,
      permissions: ['manage_sprints', 'view_sprints']
    }
  },
  {
    path: 'team',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/team/team.module').then(m => m.TeamModule),
    data: {
      requiresAuth: true,
      permissions: ['manage_team', 'view_team_tasks']
    }
  },
  {
    path: 'time-tracking',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/time-tracking/time-tracking.module').then(m => m.TimeTrackingModule),
    data: { requiresAuth: true }
  },
  {
    path: 'calendar',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/calendar/calendar.component').then(c => c.CalendarComponent),
    data: { requiresAuth: true }
  },
  {
    path: 'notifications',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
    data: { requiresAuth: true }
  },
  {
    path: 'analytics',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule),
    data: {
      requiresAuth: true,
      permissions: ['view_analytics']
    }
  },
  {
    path: 'reports',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
    data: {
      requiresAuth: true,
      permissions: ['view_analytics']
    }
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
    data: { requiresAuth: true }
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/auth/profile/profile.component').then(c => c.ProfileComponent),
    data: { requiresAuth: true }
  },
  // Admin routes (optional future use)
  // {
  //   path: 'admin',
  //   canActivate: [AuthGuard],
  //   loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
  //   data: {
  //     requiresAuth: true,
  //     roles: ['ADMIN']
  //   }
  // },
  {
    path: 'access-denied',
    loadChildren: () => import('./shared/access-denied/access-denied.module').then(m => m.AccessDeniedModule)
  },
  // 404 page (if created)
  // {
  //   path: '404',
  //   loadChildren: () => import('./features/not-found/not-found.module').then(m => m.NotFoundModule)
  // },
  {
    path: '**',
    redirectTo: '/404'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false, // Set to true only for debugging
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'top'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
