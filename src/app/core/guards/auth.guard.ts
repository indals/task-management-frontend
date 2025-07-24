// src/app/core/guards/auth.guard.ts
import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Modern functional guard (recommended approach)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

// Legacy class-based guard (for backward compatibility)
@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}