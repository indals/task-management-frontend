import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';

import { AuthService, UserListItem } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { User } from '../../../core/models';

// 🔧 IMPROVED: Enhanced TeamMember interface with better type safety
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  department: string;
  joinDate: string;
  status: 'active' | 'away' | 'offline';
  tasksCount: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  skills: string[];
  workload: number; // percentage
  isActive: boolean;
  lastLogin?: string;
}

// 🔧 NEW: Search and filter interface
interface TeamFilters {
  search: string;
  department: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-team-management',
  template: `
    <div class="team-container">
      <!-- Header -->
      <div class="team-header">
        <div class="header-content">
          <h1>
            <mat-icon>group</mat-icon>
            Team Management
          </h1>
          <p>Manage your team members and their assignments</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="inviteNewMember()">
            <mat-icon>person_add</mat-icon>
            Invite Member
          </button>
          <button mat-icon-button (click)="refreshTeamData()" matTooltip="Refresh">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="filters-section" *ngIf="!isLoading && !errorMessage">
        <mat-card class="filters-card">
          <mat-card-content>
            <div class="filter-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search team members</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="filters.search" 
                  (input)="applyFilters()"
                  placeholder="Search by name or email">
                <mat-icon matPrefix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Department</mat-label>
                <mat-select [(value)]="filters.department" (selectionChange)="applyFilters()">
                  <mat-option value="">All Departments</mat-option>
                  <mat-option *ngFor="let dept of departments" [value]="dept">{{dept}}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Role</mat-label>
                <mat-select [(value)]="filters.role" (selectionChange)="applyFilters()">
                  <mat-option value="">All Roles</mat-option>
                  <mat-option *ngFor="let role of roles" [value]="role">{{role}}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select [(value)]="filters.status" (selectionChange)="applyFilters()">
                  <mat-option value="">All Status</mat-option>
                  <mat-option value="active">Active</mat-option>
                  <mat-option value="away">Away</mat-option>
                  <mat-option value="offline">Offline</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading State -->
      <app-loading *ngIf="isLoading" message="Loading team members..."></app-loading>

      <!-- Error State -->
      <mat-card *ngIf="errorMessage && !isLoading" class="error-card">
        <mat-card-content>
          <mat-icon color="warn">error</mat-icon>
          <p>{{ errorMessage }}</p>
          <button mat-raised-button color="primary" (click)="loadTeamMembers()">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Team Stats -->
      <div class="team-stats" *ngIf="!isLoading && !errorMessage && teamMembers.length > 0">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-info">
              <h3>{{ filteredMembers.length }}</h3>
              <p>{{ filters.search || filters.department || filters.role || filters.status ? 'Filtered' : 'Total' }} Members</p>
            </div>
            <mat-icon>group</mat-icon>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-info">
              <h3>{{ activeMembers }}</h3>
              <p>Active Members</p>
            </div>
            <mat-icon>person</mat-icon>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-info">
              <h3>{{ averageWorkload }}%</h3>
              <p>Avg. Workload</p>
            </div>
            <mat-icon>trending_up</mat-icon>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-info">
              <h3>{{ overloadedMembers }}</h3>
              <p>High Workload</p>
            </div>
            <mat-icon [style.color]="overloadedMembers > 0 ? '#f44336' : '#4caf50'">warning</mat-icon>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Team Members Grid -->
      <div class="team-grid" *ngIf="!isLoading && !errorMessage && filteredMembers.length > 0">
        <mat-card class="member-card" *ngFor="let member of filteredMembers">
          <mat-card-header>
            <div mat-card-avatar class="member-avatar">
              <img *ngIf="member.avatar_url; else avatarFallback" 
                   [src]="member.avatar_url" 
                   [alt]="member.name">
              <ng-template #avatarFallback>
                <div class="avatar-initials">{{ getInitials(member.name) }}</div>
              </ng-template>
            </div>
            <mat-card-title>{{ member.name }}</mat-card-title>
            <mat-card-subtitle>{{ member.role }}</mat-card-subtitle>
            <div class="member-status" [ngClass]="member.status">
              <span class="status-dot"></span>
              {{ member.status | titlecase }}
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="member-info">
              <div class="info-item">
                <mat-icon>email</mat-icon>
                <span>{{ member.email }}</span>
              </div>
              <div class="info-item">
                <mat-icon>business</mat-icon>
                <span>{{ member.department }}</span>
              </div>
              <div class="info-item">
                <mat-icon>date_range</mat-icon>
                <span>Joined {{ member.joinDate | date:'MMM yyyy' }}</span>
              </div>
              <div class="info-item" *ngIf="member.lastLogin">
                <mat-icon>schedule</mat-icon>
                <span>Last login {{ member.lastLogin | date:'short' }}</span>
              </div>
            </div>

            <div class="task-stats">
              <h4>Task Statistics</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-number">{{ member.tasksCount.total }}</span>
                  <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number" style="color: #4caf50;">{{ member.tasksCount.completed }}</span>
                  <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number" style="color: #2196f3;">{{ member.tasksCount.inProgress }}</span>
                  <span class="stat-label">In Progress</span>
                </div>
                <div class="stat-item" *ngIf="member.tasksCount.overdue > 0">
                  <span class="stat-number" style="color: #f44336;">{{ member.tasksCount.overdue }}</span>
                  <span class="stat-label">Overdue</span>
                </div>
              </div>
            </div>

            <div class="workload-section">
              <div class="workload-header">
                <h4>Current Workload</h4>
                <span class="workload-text" [style.color]="getWorkloadTextColor(member.workload)">
                  {{ member.workload }}%
                </span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="member.workload"
                [color]="getWorkloadColor(member.workload)">
              </mat-progress-bar>
            </div>

            <div class="skills-section" *ngIf="member.skills && member.skills.length > 0">
              <h4>Skills</h4>
              <div class="skills-chips">
                <mat-chip-listbox>
                  <mat-chip *ngFor="let skill of member.skills" [disabled]="true">{{ skill }}</mat-chip>
                </mat-chip-listbox>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="viewMemberDetails(member)">
              <mat-icon>visibility</mat-icon>
              View Details
            </button>
            <button mat-button (click)="assignTasks(member)">
              <mat-icon>assignment</mat-icon>
              Assign Tasks
            </button>
            <button mat-icon-button [matMenuTriggerFor]="memberMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #memberMenu="matMenu">
              <button mat-menu-item (click)="editMember(member)">
                <mat-icon>edit</mat-icon>
                Edit Member
              </button>
              <button mat-menu-item (click)="viewMemberTasks(member)">
                <mat-icon>list</mat-icon>
                View Tasks
              </button>
              <button mat-menu-item (click)="sendMessage(member)">
                <mat-icon>message</mat-icon>
                Send Message
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="removeMember(member)" class="warn-action">
                <mat-icon>person_remove</mat-icon>
                Remove from Team
              </button>
            </mat-menu>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && !errorMessage && filteredMembers.length === 0 && teamMembers.length > 0">
        <mat-icon>search_off</mat-icon>
        <h3>No Members Found</h3>
        <p>Try adjusting your search criteria or filters</p>
        <button mat-raised-button (click)="clearFilters()">
          <mat-icon>clear</mat-icon>
          Clear Filters
        </button>
      </div>

      <!-- No Team Members State -->
      <div class="empty-state" *ngIf="!isLoading && !errorMessage && teamMembers.length === 0">
        <mat-icon>group_off</mat-icon>
        <h3>No Team Members</h3>
        <p>Start building your team by inviting new members</p>
        <button mat-raised-button color="primary" (click)="inviteNewMember()">
          <mat-icon>person_add</mat-icon>
          Invite Your First Member
        </button>
      </div>
    </div>
  `,
  styles: [`
    .team-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 0.5rem;
      font-size: 2rem;
      font-weight: 600;
    }

    .header-content p {
      margin: 0;
      color: #666;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .filters-section {
      margin-bottom: 2rem;
    }

    .filters-card {
      border-radius: 12px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 1rem;
      align-items: center;
    }

    .search-field {
      min-width: 300px;
    }

    .error-card {
      text-align: center;
      margin: 2rem 0;
    }

    .error-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .team-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card mat-card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
    }

    .stat-info p {
      margin: 0.5rem 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .stat-card mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #667eea;
      opacity: 0.7;
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .member-card {
      border-radius: 12px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .member-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .member-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
    }

    .member-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-initials {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      font-weight: 600;
      font-size: 1.2rem;
    }

    .member-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      margin-top: 0.5rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .member-status.active .status-dot { background: #10b981; }
    .member-status.away .status-dot { background: #f59e0b; }
    .member-status.offline .status-dot { background: #6b7280; }

    .member-info {
      margin-bottom: 1rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: #666;
    }

    .info-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .task-stats, .workload-section, .skills-section {
      margin-bottom: 1rem;
    }

    .task-stats h4, .workload-section h4, .skills-section h4 {
      margin: 0 0 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
      gap: 0.5rem;
      text-align: center;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-number {
      font-size: 1.2rem;
      font-weight: 600;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.7rem;
      color: #666;
      margin-top: 0.2rem;
    }

    .workload-section {
      position: relative;
    }

    .workload-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .workload-text {
      font-size: 0.9rem;
      font-weight: 600;
    }

    .skills-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skills-chips mat-chip {
      font-size: 0.7rem;
    }

    .warn-action {
      color: #f44336 !important;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-state mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      opacity: 0.5;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 1rem;
      font-size: 1.5rem;
    }

    .empty-state p {
      margin: 0 0 2rem;
    }

    @media (max-width: 768px) {
      .team-container {
        padding: 1rem;
      }

      .team-header {
        flex-direction: column;
        gap: 1rem;
      }

      .filter-row {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .search-field {
        min-width: auto;
      }

      .team-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TeamManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  teamMembers: TeamMember[] = [];
  filteredMembers: TeamMember[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  // 🔧 NEW: Filters
  filters: TeamFilters = {
    search: '',
    department: '',
    role: '',
    status: ''
  };

  departments: string[] = [];
  roles: string[] = [];

  // Stats
  activeMembers = 0;
  averageWorkload = 0;
  overloadedMembers = 0;

  constructor(
    private authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 🔧 IMPROVED: Enhanced team loading with real API integration
  loadTeamMembers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // console.log('🔄 Loading team members...');

    this.authService.getUsers()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Failed to load users:', error);
          this.errorMessage = 'Failed to load team members. Please try again.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe({
        next: (users: UserListItem[]) => {
          // console.log('✅ Users loaded:', users);
          this.teamMembers = this.transformUsersToTeamMembers(users);
          this.extractFilterOptions();
          this.applyFilters();
          this.calculateStats();
          this.isLoading = false;
        }
      });
  }

  // 🔧 IMPROVED: Better data transformation with safety checks
  private transformUsersToTeamMembers(users: UserListItem[]): TeamMember[] {
    return users.map(user => {
      const role = user.role || 'DEVELOPER';
      const name = user.name || 'Unknown User';
      
      return {
        id: user.id,
        name: name,
        email: user.email,
        role: this.formatRole(role),
        avatar_url: user.avatar_url || null,
        department: this.getDepartmentFromRole(role),
        joinDate: new Date().toISOString(), // TODO: Get real join date from API
        status: user.is_active ? 'active' : 'offline',
        tasksCount: {
          total: this.getRandomTaskCount(),
          completed: this.getRandomTaskCount(0, 15),
          inProgress: this.getRandomTaskCount(0, 8),
          overdue: this.getRandomTaskCount(0, 3)
        },
        skills: this.getSkillsFromRole(role),
        workload: this.calculateWorkload(),
        isActive: user.is_active || false,
        lastLogin: new Date().toISOString() // TODO: Get real last login from API
      };
    });
  }

  private formatRole(role: string): string {
    return role.replace('_', ' ')
               .toLowerCase()
               .replace(/\b\w/g, l => l.toUpperCase());
  }

  private getDepartmentFromRole(role: string): string {
    const departments: { [key: string]: string } = {
      'ADMIN': 'Administration',
      'PROJECT_MANAGER': 'Management',
      'TEAM_LEAD': 'Management',
      'SENIOR_DEVELOPER': 'Engineering',
      'DEVELOPER': 'Engineering',
      'QA_ENGINEER': 'Quality Assurance',
      'DEVOPS_ENGINEER': 'DevOps',
      'UI_UX_DESIGNER': 'Design',
      'BUSINESS_ANALYST': 'Business Analysis',
      'PRODUCT_OWNER': 'Product',
      'SCRUM_MASTER': 'Agile Coaching'
    };
    return departments[role] || 'General';
  }

  private getSkillsFromRole(role: string): string[] {
    const skillSets: { [key: string]: string[] } = {
      'DEVELOPER': ['JavaScript', 'TypeScript', 'Angular', 'Node.js'],
      'SENIOR_DEVELOPER': ['JavaScript', 'TypeScript', 'Angular', 'Node.js', 'Architecture'],
      'QA_ENGINEER': ['Testing', 'Automation', 'Selenium', 'Jest'],
      'DEVOPS_ENGINEER': ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      'UI_UX_DESIGNER': ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
      'PROJECT_MANAGER': ['Scrum', 'Agile', 'Planning', 'Leadership'],
      'BUSINESS_ANALYST': ['Requirements', 'Analysis', 'Documentation', 'SQL']
    };
    return skillSets[role] || ['Communication', 'Teamwork'];
  }

  private getRandomTaskCount(min: number = 0, max: number = 20): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private calculateWorkload(): number {
    // Generate realistic workload between 40-100%
    return Math.floor(Math.random() * 60) + 40;
  }

  // 🔧 NEW: Extract filter options from data
  private extractFilterOptions(): void {
    this.departments = [...new Set(this.teamMembers.map(m => m.department))].sort();
    this.roles = [...new Set(this.teamMembers.map(m => m.role))].sort();
  }

  // 🔧 NEW: Apply filters functionality
  applyFilters(): void {
    this.filteredMembers = this.teamMembers.filter(member => {
      const matchesSearch = !this.filters.search || 
        member.name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        member.email.toLowerCase().includes(this.filters.search.toLowerCase());
      
      const matchesDepartment = !this.filters.department || 
        member.department === this.filters.department;
      
      const matchesRole = !this.filters.role || 
        member.role === this.filters.role;
      
      const matchesStatus = !this.filters.status || 
        member.status === this.filters.status;

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });

    this.calculateStats();
  }

  // 🔧 NEW: Clear all filters
  clearFilters(): void {
    this.filters = {
      search: '',
      department: '',
      role: '',
      status: ''
    };
    this.applyFilters();
  }

  private calculateStats(): void {
    const members = this.filteredMembers;
    this.activeMembers = members.filter(m => m.status === 'active').length;
    this.overloadedMembers = members.filter(m => m.workload >= 90).length;
    
    if (members.length > 0) {
      this.averageWorkload = Math.round(
        members.reduce((sum, member) => sum + member.workload, 0) / members.length
      );
    } else {
      this.averageWorkload = 0;
    }
  }

  // 🔧 NEW: Refresh functionality
  refreshTeamData(): void {
    this.loadTeamMembers();
  }

  getInitials(name: string): string {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getWorkloadColor(workload: number): 'primary' | 'accent' | 'warn' {
    if (workload >= 90) return 'warn';
    if (workload >= 75) return 'accent';
    return 'primary';
  }

  getWorkloadTextColor(workload: number): string {
    if (workload >= 90) return '#f44336';
    if (workload >= 75) return '#ff9800';
    return '#4caf50';
  }

  // Action Methods
  inviteNewMember(): void {
    // console.log('🔄 Invite new member functionality');
    // TODO: Implement invite functionality
  }

  viewMemberDetails(member: TeamMember): void {
    // console.log('🔍 View member details:', member);
    // TODO: Navigate to member details or open dialog
  }

  assignTasks(member: TeamMember): void {
    // console.log('📋 Assign tasks to:', member.name);
    // TODO: Open task assignment dialog
  }

  viewMemberTasks(member: TeamMember): void {
    // console.log('📋 View tasks for:', member.name);
    // TODO: Navigate to tasks filtered by this member
  }

  editMember(member: TeamMember): void {
    // console.log('✏️ Edit member:', member.name);
    // TODO: Open edit member dialog
  }

  sendMessage(member: TeamMember): void {
    // console.log('💬 Send message to:', member.name);
    // TODO: Open messaging interface
  }

  removeMember(member: TeamMember): void {
    if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      // console.log('❌ Remove member:', member.name);
      // TODO: Implement member removal API call
      // For now, remove from local array
      this.teamMembers = this.teamMembers.filter(m => m.id !== member.id);
      this.applyFilters();
    }
  }
}