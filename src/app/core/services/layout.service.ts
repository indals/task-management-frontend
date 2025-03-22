// src/app/core/services/layout.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  sidebarCollapsed$: Observable<boolean> = this.sidebarCollapsedSubject.asObservable();
  
  private isMobileSubject = new BehaviorSubject<boolean>(window.innerWidth < 768);
  isMobile$: Observable<boolean> = this.isMobileSubject.asObservable();

  constructor() {
    // Listen for window resize events to update mobile state
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
    
    // Initial check
    this.checkScreenSize();
  }

  toggleSidebar(): void {
    this.sidebarCollapsedSubject.next(!this.sidebarCollapsedSubject.value);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
  }

  private checkScreenSize(): void {
    const isMobile = window.innerWidth < 768;
    if (isMobile !== this.isMobileSubject.value) {
      this.isMobileSubject.next(isMobile);
      
      // Automatically collapse sidebar on mobile
      if (isMobile) {
        this.setSidebarCollapsed(true);
      }
    }
  }
}