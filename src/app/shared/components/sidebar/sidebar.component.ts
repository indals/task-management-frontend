import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ProjectService } from '../../../core/services/project.service';
import { User } from '../../../core/models/user.model';
import { Project } from '../../../core/models/project.model';

interface NavItem {
  title: string;
  icon: string;
  route: string;
  active: boolean;
  badge?: string | number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  navItems: NavItem[] = [
    { title: 'Dashboard', icon: 'fa fa-home', route: '/dashboard', active: false },
    { title: 'Tasks', icon: 'fa fa-tasks', route: '/tasks', active: false },
    { title: 'Projects', icon: 'fa fa-folder-open', route: '/projects', active: false },
    { title: 'Calendar', icon: 'fa fa-calendar', route: '/calendar', active: false },
    { title: 'Reports', icon: 'fa fa-chart-bar', route: '/reports', active: false },
    { title: 'Notifications', icon: 'fa fa-bell', route: '/notifications', active: false, badge: 0 }
  ];
  
  currentUser: User | null = null;
  isCollapsed = false;
  isMobile = false;
  recentProjects: Project[] = [];
  hasProjectAccess = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private layoutService: LayoutService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    // Get current user
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        // Check user permissions for projects access
        this.hasProjectAccess = user?.role !== 'guest';
        
        if (this.hasProjectAccess) {
          this.loadRecentProjects();
        }
      })
    );

    // Update active state based on current route
    this.subscriptions.push(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.updateActiveState(event.url);
        })
    );
    
    // Set initial active state
    this.updateActiveState(this.router.url);
    
    // Subscribe to sidebar state
    this.subscriptions.push(
      this.layoutService.sidebarCollapsed$.subscribe((collapsed: boolean) => {
        this.isCollapsed = collapsed;
      })
    );
    
    // Subscribe to mobile state
    this.subscriptions.push(
      this.layoutService.isMobile$.subscribe((mobile: boolean) => {
        this.isMobile = mobile;
      })
    );
  }
  
  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }
  
  closeSidebar(): void {
    if (this.isMobile) {
      this.layoutService.setSidebarCollapsed(true);
    }
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
  
  private loadRecentProjects(): void {
    this.projectService.getRecentProjects().subscribe(
      (projects: Project[]) => {
        this.recentProjects = projects.slice(0, 3); // Show only 3 most recent projects
      },
      (error: any) => {
        console.error('Error loading recent projects', error);
      }
    );
  }
}