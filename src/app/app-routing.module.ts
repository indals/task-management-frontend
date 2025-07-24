import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  // Keep login/register at root level for backward compatibility
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(c => c.RegisterComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/auth/profile/profile.component').then(c => c.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [authGuard]
  },
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.module').then(m => m.TasksModule),
    canActivate: [authGuard]
  },
  {
    path: 'projects',
    loadComponent: () => import('./features/projects/projects.component').then(c => c.ProjectsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.component').then(c => c.CalendarComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component').then(c => c.ReportsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
    canActivate: [authGuard]
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    scrollPositionRestoration: 'top',
    preloadingStrategy: 'optional' // Optimize bundle loading
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }