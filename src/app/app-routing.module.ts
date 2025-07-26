// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { PreloadAllModules } from '@angular/router';
// import { AuthGuard } from './core/guards/auth.guard';

// const routes: Routes = [
//   { 
//     path: '', 
//     redirectTo: '/dashboard', 
//     pathMatch: 'full' 
//   },
//   {
//     path: 'auth',
//     loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
//   },
//   {
//     path: 'dashboard',
//     loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
//     canActivate: [AuthGuard]
//   },
//   {
//     path: 'tasks',
//     loadChildren: () => import('./features/tasks/tasks.module').then(m => m.TasksModule),
//     canActivate: [AuthGuard]
//   },
//   {
//     path: 'projects',
//     loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule),
//     canActivate: [AuthGuard],
//     data: { permissions: ['view_all_projects', 'view_team_projects'] }
//   },
//   {
//     path: 'sprints',
//     loadChildren: () => import('./features/sprints/sprint-management/sprints.module').then(m => m.SprintsModule),
//     canActivate: [AuthGuard],
//     data: { permissions: ['manage_sprints', 'view_sprints'] }
//   },
//   {
//     path: 'team',
//     loadChildren: () => import('./features/team/team.module').then(m => m.TeamModule),
//     canActivate: [AuthGuard],
//     data: { permissions: ['manage_team', 'view_team_tasks'] }
//   },
//   {
//     path: 'time-tracking',
//     loadChildren: () => import('./features/time-tracking/time-tracking.module').then(m => m.TimeTrackingModule),
//     canActivate: [AuthGuard]
//   },
//   {
//     path: 'analytics',
//     loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule),
//     canActivate: [AuthGuard],
//     data: { permissions: ['view_analytics'] }
//   },
//   {
//     path: 'calendar',
//     loadComponent: () => import('./features/calendar/calendar.component').then(c => c.CalendarComponent),
//     canActivate: [AuthGuard]
//   },
//   {
//     path: 'notifications',
//     loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
//     canActivate: [AuthGuard]
//   },
//   {
//     path: 'settings',
//     loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
//     canActivate: [AuthGuard]
//   },
//   {
//     path: 'profile',
//     loadComponent: () => import('./features/auth/profile/profile.component').then(c => c.ProfileComponent),
//     canActivate: [AuthGuard]
//   },
//   {
//     path: 'access-denied',
//     loadComponent: () => import('./shared/access-denied/access-denied.component').then(c => c.AccessDeniedComponent)
//   },
//   { 
//     path: '**', 
//     redirectTo: '/dashboard' 
//   }
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes, {
//     enableTracing: false, // Set to true for debugging
//     preloadingStrategy: PreloadAllModules,
//     scrollPositionRestoration: 'top',
//     onSameUrlNavigation: 'reload'
//   })],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }



import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreloadAllModules } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.module').then(m => m.TasksModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'projects',
    loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule),
    canActivate: [AuthGuard],
    data: { permissions: ['view_all_projects', 'view_team_projects'] }
  },
  {
    path: 'sprints',
    loadChildren: () => import('./features/sprints/sprints.module').then(m => m.SprintsModule),
    canActivate: [AuthGuard],
    data: { permissions: ['manage_sprints', 'view_sprints'] }
  },
  {
    path: 'team',
    loadChildren: () => import('./features/team/team.module').then(m => m.TeamModule),
    canActivate: [AuthGuard],
    data: { permissions: ['manage_team', 'view_team_tasks'] }
  },
  {
    path: 'time-tracking',
    loadChildren: () => import('./features/time-tracking/time-tracking.module').then(m => m.TimeTrackingModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'analytics',
    loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule),
    canActivate: [AuthGuard],
    data: { permissions: ['view_analytics'] }
  },
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.component').then(c => c.CalendarComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/auth/profile/profile.component').then(c => c.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./shared/access-denied/access-denied.component').then(c => c.AccessDeniedComponent)
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Set to true for debugging
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'top',
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }