import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProfileComponent } from './features/auth/profile/profile.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
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
    loadComponent: () => import('./features/projects/projects.component').then(c => c.ProjectsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.component').then(c => c.CalendarComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./features/reports/reports.component').then(c => c.ReportsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }