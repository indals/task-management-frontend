// src/app/features/team/team-management/team-management.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  department: string;
  joinDate: string;
  status: 'active' | 'away' | 'offline';
  tasksCount: {
    total: number;
    completed: number;
    inProgress: number;
  };
  skills: string[];
  workload: number; // percentage
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
        </div>
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
      <div class="team-stats" *ngIf="!isLoading && !errorMessage">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-info">
              <h3>{{ totalMembers }}</h3>
              <p>Total Members</p>
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
      </div>

      <!-- Team Members Grid -->
      <div class="team-grid" *ngIf="!isLoading && !errorMessage">
        <mat-card class="member-card" *ngFor="let member of teamMembers">
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
            </div>

            <div class="task-stats">
              <h4>Task Statistics</h4>
              <div class="stats-row">
                <span>Total: {{ member.tasksCount.total }}</span>
                <span>Completed: {{ member.tasksCount.completed }}</span>
                <span>In Progress: {{ member.tasksCount.inProgress }}</span>
              </div>
            </div>

            <div class="workload-section">
              <h4>Current Workload</h4>
              <mat-progress-bar 
                mode="determinate" 
                [value]="member.workload"
                [color]="getWorkloadColor(member.workload)">
              </mat-progress-bar>
              <span class="workload-text">{{ member.workload }}%</span>
            </div>

            <div class="skills-section" *ngIf="member.skills.length > 0">
              <h4>Skills</h4>
              <div class="skills-chips">
                <mat-chip-listbox>
                  <mat-chip *ngFor="let skill of member.skills">{{ skill }}</mat-chip>
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
                Edit
              </button>
              <button mat-menu-item (click)="removeMember(member)">
                <mat-icon>person_remove</mat-icon>
                Remove
              </button>
            </mat-menu>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
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

    .stats-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.8rem;
      color: #666;
    }

    .workload-section {
      position: relative;
    }

    .workload-text {
      position: absolute;
      right: 0;
      top: 1.5rem;
      font-size: 0.8rem;
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

      .team-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TeamManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  teamMembers: TeamMember[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  // Stats
  totalMembers = 0;
  activeMembers = 0;
  averageWorkload = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTeamMembers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.authService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.teamMembers = this.transformUsersToTeamMembers(users);
          this.calculateStats();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load team members';
          this.isLoading = false;
        }
      });
  }

  private transformUsersToTeamMembers(users: User[]): TeamMember[] {
    return users.map(user => ({
      id: user.id,
      name: user.name || user.username || 'Unknown User',
      email: user.email,
      role: user.role?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Member',
      avatar_url: user.avatar_url,
      department: this.getDepartmentFromRole(user.role || ''),
      joinDate: user.created_at || new Date().toISOString(),
      status: this.getRandomStatus(),
      tasksCount: {
        total: Math.floor(Math.random() * 20) + 5,
        completed: Math.floor(Math.random() * 15) + 2,
        inProgress: Math.floor(Math.random() * 8) + 1
      },
      skills: this.getSkillsFromRole(user.role || ''),
      workload: Math.floor(Math.random() * 40) + 60
    }));
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

  private getRandomStatus(): 'active' | 'away' | 'offline' {
    const statuses: ('active' | 'away' | 'offline')[] = ['active', 'away', 'offline'];
    const weights = [0.7, 0.2, 0.1]; // 70% active, 20% away, 10% offline
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return statuses[i];
      }
    }
    return 'active';
  }

  private calculateStats(): void {
    this.totalMembers = this.teamMembers.length;
    this.activeMembers = this.teamMembers.filter(m => m.status === 'active').length;
    this.averageWorkload = Math.round(
      this.teamMembers.reduce((sum, member) => sum + member.workload, 0) / this.totalMembers
    );
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getWorkloadColor(workload: number): 'primary' | 'accent' | 'warn' {
    if (workload >= 90) return 'warn';
    if (workload >= 75) return 'accent';
    return 'primary';
  }

  // Action Methods
  inviteNewMember(): void {
    console.log('Invite new member');
    // TODO: Implement invite functionality
  }

  viewMemberDetails(member: TeamMember): void {
    console.log('View member details:', member);
    // TODO: Navigate to member details
  }

  assignTasks(member: TeamMember): void {
    console.log('Assign tasks to:', member);
    // TODO: Open task assignment dialog
  }

  editMember(member: TeamMember): void {
    console.log('Edit member:', member);
    // TODO: Open edit member dialog
  }

  removeMember(member: TeamMember): void {
    if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      console.log('Remove member:', member);
      // TODO: Implement member removal
    }
  }
}