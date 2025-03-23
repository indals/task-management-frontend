import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ProfileComponent } from './features/auth/profile/profile.component';
import { AuthGuard } from './core/guards/auth.guard';  // Import AuthGuard

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Redirect '/' to 'login'
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },  // Add AuthGuard
  { 
    path: 'tasks', 
    loadChildren: () => import('./features/tasks/tasks.module').then(m => m.TasksModule),
    canActivate: [AuthGuard]  // Add AuthGuard
  },
  { 
    path: 'notifications', 
    loadChildren: () => import('./features/notifications/notifications.module').then(m => m.NotificationsModule),
    canActivate: [AuthGuard]  // Add AuthGuard
  },
  // { 
  //   path: 'dashboard', 
  //   loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
  //   canActivate: [AuthGuard]
  // },
  { 
    path: 'analytics', 
    loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule),
    canActivate: [AuthGuard]  // Add AuthGuard
  },
  { path: '**', redirectTo: 'login' }  // Wildcard route for 404
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],  // Load routes globally
  exports: [RouterModule]
})
export class AppRoutingModule { }