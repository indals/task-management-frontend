// src/app/core/guards/anti-auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AntiAuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Check if user is authenticated
    return this.authService.currentUser$.pipe(
      map(user => {
        if (user) {
          // User is logged in, redirect to dashboard
          // console.log('🔒 AntiAuthGuard: User is authenticated, redirecting to dashboard');
          this.router.navigate(['/dashboard']);
          return false;
        } else {
          // User is not logged in, allow access to auth pages
          // console.log('✅ AntiAuthGuard: User not authenticated, allowing access to auth routes');
          return true;
        }
      })
    );
  }
}