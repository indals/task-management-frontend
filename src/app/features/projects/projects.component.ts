// src/app/features/projects/projects.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  progress: number;
  startDate: Date;
  endDate?: Date;
  teamMembers: string[];
  tasksCount: {
    total: number;
    completed: number;
    pending: number;
  };
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  budget?: number;
  spent?: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-container">
      <!-- Header -->
      <div class="projects-header">
        <div class="header-left">
          <h1>Projects</h1>
          <p>Manage and track your project progress</p>
        </div>
        <div class="header-actions">
          <div class="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search projects..." 
              [(ngModel)]="searchTerm"
              (input)="filterProjects()"
            />
          </div>
          <select [(ngModel)]="statusFilter" (change)="filterProjects()" class="status-filter">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button class="create-btn" (click)="createProject()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Project
          </button>
        </div>
      </div>

      <!-- View Toggle -->
      <div class="view-toggle">
        <button 
          class="view-btn" 
          [class.active]="viewMode === 'grid'"
          (click)="viewMode = 'grid'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Grid
        </button>
        <button 
          class="view-btn" 
          [class.active]="viewMode === 'list'"
          (click)="viewMode = 'list'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          List
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading projects...</p>
      </div>

      <!-- Projects Grid View -->
      <div class="projects-grid" *ngIf="!loading && viewMode === 'grid' && filteredProjects.length > 0">
        <div class="project-card" *ngFor="let project of filteredProjects" (click)="viewProject(project)">
          <div class="card-header">
            <div class="project-info">
              <h3>{{ project.name }}</h3>
              <p>{{ project.description }}</p>
            </div>
            <div class="project-menu">
              <button class="menu-btn" (click)="toggleProjectMenu($event)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>

          <div class="project-stats">
            <div class="stat">
              <span class="stat-value">{{ project.tasksCount.total }}</span>
              <span class="stat-label">Total Tasks</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ project.tasksCount.completed }}</span>
              <span class="stat-label">Completed</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ project.teamMembers.length }}</span>
              <span class="stat-label">Team Members</span>
            </div>
          </div>

          <div class="project-progress">
            <div class="progress-header">
              <span class="progress-label">Progress</span>
              <span class="progress-value">{{ project.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="project.progress"></div>
            </div>
          </div>

          <div class="card-footer">
            <div class="project-status">
              <span class="status-badge" [class]="'status-' + project.status.toLowerCase()">
                {{ project.status | titlecase }}
              </span>
              <span class="priority-badge" [class]="'priority-' + project.priority.toLowerCase()">
                {{ project.priority }}
              </span>
            </div>
            <div class="project-dates">
              <span class="due-date">Due: {{ project.endDate | date:'MMM dd' || 'No due date' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects List View -->
      <div class="projects-list" *ngIf="!loading && viewMode === 'list' && filteredProjects.length > 0">
        <div class="list-header">
          <div class="col-name">Project Name</div>
          <div class="col-status">Status</div>
          <div class="col-progress">Progress</div>
          <div class="col-tasks">Tasks</div>
          <div class="col-team">Team</div>
          <div class="col-due">Due Date</div>
          <div class="col-actions">Actions</div>
        </div>

        <div class="list-row" *ngFor="let project of filteredProjects" (click)="viewProject(project)">
          <div class="col-name">
            <div class="project-name-info">
              <h4>{{ project.name }}</h4>
              <p>{{ project.description }}</p>
            </div>
          </div>
          <div class="col-status">
            <span class="status-badge" [class]="'status-' + project.status.toLowerCase()">
              {{ project.status | titlecase }}
            </span>
          </div>
          <div class="col-progress">
            <div class="progress-cell">
              <div class="progress-bar small">
                <div class="progress-fill" [style.width.%]="project.progress"></div>
              </div>
              <span class="progress-text">{{ project.progress }}%</span>
            </div>
          </div>
          <div class="col-tasks">
            <span class="tasks-info">{{ project.tasksCount.completed }}/{{ project.tasksCount.total }}</span>
          </div>
          <div class="col-team">
            <div class="team-avatars">
              <div class="avatar" *ngFor="let member of project.teamMembers.slice(0, 3)">
                {{ getInitials(member) }}
              </div>
              <div class="avatar-more" *ngIf="project.teamMembers.length > 3">
                +{{ project.teamMembers.length - 3 }}
              </div>
            </div>
          </div>
          <div class="col-due">
            <span class="due-date" [class]="getDueDateClass(project.endDate)">
              {{ project.endDate | date:'MMM dd, yyyy' || 'No due date' }}
            </span>
          </div>
          <div class="col-actions">
            <button class="action-btn" (click)="editProject($event, project)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete" (click)="deleteProject($event, project)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && filteredProjects.length === 0">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        </div>
        <h3>{{ searchTerm || statusFilter ? 'No projects found' : 'No projects yet' }}</h3>
        <p>{{ searchTerm || statusFilter ? 'Try adjusting your search or filter criteria' : 'Create your first project to get started' }}</p>
        <button class="create-btn" (click)="createProject()" *ngIf="!searchTerm && !statusFilter">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Project
        </button>
      </div>
    </div>
  `,
  styles: [`
    .projects-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .projects-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      gap: 20px;
    }

    .header-left h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 32px;
      font-weight: 700;
    }

    .header-left p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-box svg {
      position: absolute;
      left: 12px;
      color: #666;
      z-index: 1;
    }

    .search-box input {
      padding: 10px 12px 10px 40px;
      border: 1px solid #ddd;
      border-radius: 8px;
      width: 250px;
      font-size: 14px;
      background: white;
    }

    .search-box input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
    }

    .status-filter {
      padding: 10px 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      font-size: 14px;
    }

    .create-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .create-btn:hover {
      background: #0056b3;
      transform: translateY(-1px);
    }

    .view-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }

    .view-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .view-btn:hover {
      border-color: #007bff;
      color: #007bff;
    }

    .view-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .project-card {
      background: white;
      border: 1px solid #e1e5e9;
      border-radius: 12px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .project-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      border-color: #007bff;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .project-info h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 20px;
      font-weight: 600;
    }

    .project-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }

    .menu-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      color: #666;
      transition: all 0.2s;
    }

    .menu-btn:hover {
      background: #f8f9fa;
      color: #333;
    }

    .project-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #333;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 500;
    }

    .project-progress {
      margin-bottom: 20px;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .progress-label {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .progress-value {
      font-size: 14px;
      color: #007bff;
      font-weight: 600;
    }

    .progress-bar {
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar.small {
      height: 6px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .project-status {
      display: flex;
      gap: 8px;
    }

    .status-badge, .priority-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-completed {
      background: #cce5ff;
      color: #004085;
    }

    .status-on_hold {
      background: #fff3cd;
      color: #856404;
    }

    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .priority-high {
      background: #ffebee;
      color: #c62828;
    }

    .priority-medium {
      background: #fff8e1;
      color: #f57f17;
    }

    .priority-low {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .due-date {
      font-size: 12px;
      color: #666;
    }

    .projects-list {
      background: white;
      border: 1px solid #e1e5e9;
      border-radius: 12px;
      overflow: hidden;
    }

    .list-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 120px;
      gap: 16px;
      padding: 16px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e1e5e9;
      font-weight: 600;
      color: #666;
      font-size: 14px;
    }

    .list-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 120px;
      gap: 16px;
      padding: 20px;
      border-bottom: 1px solid #f1f3f4;
      align-items: center;
      cursor: pointer;
      transition: background 0.2s;
    }

    .list-row:hover {
      background: #f8f9fa;
    }

    .list-row:last-child {
      border-bottom: none;
    }

    .project-name-info h4 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }

    .project-name-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .progress-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-text {
      font-size: 12px;
      color: #666;
      min-width: 35px;
    }

    .tasks-info {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .team-avatars {
      display: flex;
      gap: -8px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: 600;
      border: 2px solid white;
      margin-left: -8px;
    }

    .avatar:first-child {
      margin-left: 0;
    }

    .avatar-more {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #6c757d;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: 600;
      border: 2px solid white;
      margin-left: -8px;
    }

    .due-date.overdue {
      color: #dc3545;
      font-weight: 600;
    }

    .due-date.urgent {
      color: #fd7e14;
      font-weight: 600;
    }

    .col-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      background: none;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 8px;
      cursor: pointer;
      color: #666;
      transition: all 0.2s;
    }

    .action-btn:hover {
      border-color: #007bff;
      color: #007bff;
    }

    .action-btn.delete:hover {
      border-color: #dc3545;
      color: #dc3545;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
      color: #666;
    }

    .empty-icon {
      margin-bottom: 24px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 24px;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #666;
      font-size: 16px;
      max-width: 400px;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .projects-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        flex-wrap: wrap;
      }

      .search-box input {
        width: 100%;
        min-width: 200px;
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }

      .list-header,
      .list-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .col-status,
      .col-progress,
      .col-team,
      .col-due {
        display: none;
      }

      .project-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = false;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  statusFilter = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.projects = [
        {
          id: '1',
          name: 'Website Redesign',
          description: 'Complete overhaul of company website with modern design and improved UX',
          status: 'ACTIVE',
          progress: 67,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-30'),
          teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Connor'],
          tasksCount: { total: 24, completed: 16, pending: 8 },
          priority: 'HIGH',
          budget: 50000,
          spent: 33500
        },
        {
          id: '2',
          name: 'Mobile App Development',
          description: 'Native iOS and Android app for customer engagement',
          status: 'ACTIVE',
          progress: 43,
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-06-15'),
          teamMembers: ['Alice Brown', 'Bob Wilson', 'Charlie Davis'],
          tasksCount: { total: 35, completed: 15, pending: 20 },
          priority: 'HIGH',
          budget: 75000,
          spent: 32250
        },
        {
          id: '3',
          name: 'Marketing Campaign Q2',
          description: 'Digital marketing campaign for Q2 product launch',
          status: 'COMPLETED',
          progress: 100,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-28'),
          teamMembers: ['Emma Wilson', 'David Lee'],
          tasksCount: { total: 18, completed: 18, pending: 0 },
          priority: 'MEDIUM',
          budget: 25000,
          spent: 24800
        },
        {
          id: '4',
          name: 'Database Migration',
          description: 'Migration from legacy database to cloud infrastructure',
          status: 'ON_HOLD',
          progress: 25,
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-05-30'),
          teamMembers: ['Tech Team Lead', 'Database Admin'],
          tasksCount: { total: 12, completed: 3, pending: 9 },
          priority: 'MEDIUM',
          budget: 40000,
          spent: 10000
        },
        {
          id: '5',
          name: 'Security Audit',
          description: 'Comprehensive security assessment and vulnerability testing',
          status: 'ACTIVE',
          progress: 80,
          startDate: new Date('2024-02-15'),
          endDate: new Date('2024-03-15'),
          teamMembers: ['Security Specialist', 'DevOps Engineer'],
          tasksCount: { total: 8, completed: 6, pending: 2 },
          priority: 'HIGH',
          budget: 15000,
          spent: 12000
        }
      ];
      
      this.filteredProjects = [...this.projects];
      this.loading = false;
    }, 1000);
  }

  filterProjects() {
    this.filteredProjects = this.projects.filter(project => {
      const matchesSearch = !this.searchTerm || 
        project.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || project.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  createProject() {
    // Navigate to create project page or open modal
    console.log('Create new project');
    // this.router.navigate(['/projects/create']);
  }

  viewProject(project: Project) {
    // Navigate to project details
    console.log('View project:', project);
    // this.router.navigate(['/projects', project.id]);
  }

  editProject(event: Event, project: Project) {
    event.stopPropagation();
    console.log('Edit project:', project);
    // Open edit modal or navigate to edit page
  }

  deleteProject(event: Event, project: Project) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      this.projects = this.projects.filter(p => p.id !== project.id);
      this.filterProjects();
      console.log('Deleted project:', project);
    }
  }

  toggleProjectMenu(event: Event) {
    event.stopPropagation();
    console.log('Toggle project menu');
    // Implement dropdown menu
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getDueDateClass(endDate?: Date): string {
    if (!endDate) return '';
    
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return 'overdue';
    } else if (daysDiff <= 3) {
      return 'urgent';
    }
    return '';
  }
}