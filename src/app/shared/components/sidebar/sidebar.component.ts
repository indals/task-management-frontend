import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface NavItem {
  title: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  navItems: NavItem[] = [
    { title: 'Dashboard', icon: 'fa fa-home', route: '/dashboard', active: false },
    { title: 'Tasks', icon: 'fa fa-tasks', route: '/tasks', active: false },
    { title: 'Notifications', icon: 'fa fa-bell', route: '/notifications', active: false }
  ];
  
  currentUser: User | null = null;
  isCollapsed = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Update active state based on current route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveState(event.url);
      });
    
    // Set initial active state
    this.updateActiveState(this.router.url);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  private updateActiveState(url: string): void {
    this.navItems.forEach(item => {
      item.active = url.includes(item.route);
      
      // Special case for dashboard as it might be root route
      if (item.route === '/dashboard' && (url === '/' || url === '')) {
        item.active = true;
      }
    });
  }
}