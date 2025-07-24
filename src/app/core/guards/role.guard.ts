// src/app/core/guards/role.guard.ts
import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Type definition for user roles
export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'admin' | 'user' | 'guest';

// Modern functional guard for role-based access
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // First check if user is authenticated
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  
  const currentUser = authService.getCurrentUser();
  const requiredRoles = route.data?.['roles'] as UserRole[];
  
  // If no roles specified, just check authentication
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  
  // Check if user has any of the required roles
  const userRole = currentUser?.role;
  if (userRole && requiredRoles.some(role => 
    role.toLowerCase() === userRole.toLowerCase()
  )) {
    return true;
  }
  
  // User doesn't have required role, redirect based on their role
  if (userRole?.toLowerCase() === 'manager' || userRole?.toLowerCase() === 'admin') {
    router.navigate(['/dashboard']);
  } else {
    router.navigate(['/tasks']); // Employee default page
  }
  
  return false;
};

// Helper function to check if user has specific role
export const hasRole = (userRole: string | undefined, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  return userRole.toLowerCase() === requiredRole.toLowerCase();
};

// Helper function to check if user has any of the specified roles
export const hasAnyRole = (userRole: string | undefined, requiredRoles: UserRole[]): boolean => {
  if (!userRole || !requiredRoles || requiredRoles.length === 0) return false;
  return requiredRoles.some(role => role.toLowerCase() === userRole.toLowerCase());
};

// Legacy class-based guard (for backward compatibility)
@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    
    const currentUser = this.authService.getCurrentUser();
    const requiredRoles = route.data?.['roles'] as UserRole[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const userRole = currentUser?.role;
    if (userRole && requiredRoles.some(role => 
      role.toLowerCase() === userRole.toLowerCase()
    )) {
      return true;
    }
    
    if (userRole?.toLowerCase() === 'manager' || userRole?.toLowerCase() === 'admin') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/tasks']);
    }
    
    return false;
  }
}