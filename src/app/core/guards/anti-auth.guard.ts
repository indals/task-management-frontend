// src/app/core/guards/anti-auth.guard.ts - Prevents authenticated users from accessing login/register
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  Router, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot 
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

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
    
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // User is already logged in, redirect to dashboard or return URL
          const returnUrl = route.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
          return false;
        }
        
        // User is not authenticated, allow access to login/register pages
        return true;
      })
    );
  }
}