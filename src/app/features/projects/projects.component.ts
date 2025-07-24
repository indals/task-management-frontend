// // src/app/features/projects/projects.component.ts
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { TaskService } from '../../core/services/task.service';
// import { Task } from '../../core/models/task.model';
// import { User } from '../../core/models/user.model';

// interface Project {
//   id: number;
//   name: string;
//   description: string;
//   status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
//   priority: 'LOW' | 'MEDIUM' | 'HIGH';
//   start_date: string;
//   end_date: string;
//   manager: User;
//   team_members: User[];
//   tasks: Task[];
//   progress: number;
//   budget?: number;
//   spent?: number;
// }

// @Component({
//   selector: 'app-projects',
//   standalone: true,
//   imports: [CommonModule, FormsModule, ReactiveFormsModule],
//   template: `
//     <div class="projects-container">
//       <!-- Projects Header -->
//       <div class="projects-header">
//         <div class="header-title">
//           <h1>Projects</h1>
//           <p>Manage and track your project progress</p>
//         </div>
//         <div class="header-actions">
//           <button class="filter-btn" (click)="toggleFilters()">
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//               <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
//             </svg>
//             Filters
//           </button>
//           <button class="create-btn" (click)="openCreateModal()">
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//               <line x1="12" y1="5" x2="12" y2="19"></line>
//               <line x1="5" y1="12" x2="19" y2="12"></line>
//             </svg>
//             New Project
//           </button>
//         </div>
//       </div>

//       <!-- Filters Panel -->
//       <div class="filters-panel" [class.active]="showFilters">
//         <div class="filter-group">
//           <label>Status</label>
//           <select [(ngModel)]="filters.status" (change)="applyFilters()">
//             <option value="">All Statuses</option>
//             <option value="PLANNING">Planning</option>
//             <option value="ACTIVE">Active</option>
//             <option value="ON_HOLD">On Hold</option>
//             <option value="COMPLETED">Completed</option>
//             <option value="CANCELLED">Cancelled</option>
//           </select>
//         </div>
        
//         <div class="filter-group">
//           <label>Priority</label>
//           <select [(ngModel)]="filters.priority" (change)="applyFilters()">
//             <option value="">All Priorities</option>
//             <option value="HIGH">High</option>
//             <option value="MEDIUM">Medium</option>
//             <option value="LOW">Low</option>
//           </select>
//         </div>
        
//         <div class="filter-group">
//           <label>Search</label>
//           <input 
//             type="text" 
//             placeholder="Search projects..."
//             [(ngModel)]="filters.search"
//             (input)="applyFilters()"
//           >
//         </div>
        
//         <div class="filter-actions">
//           <button class="clear-btn" (click)="clearFilters()">Clear All</button>
//         </div>
//       </div>

//       <!-- View Toggle -->
//       <div class="view-toggle">
//         <button 
//           class="view-btn" 
//           [class.active]="viewMode === 'grid'"
//           (click)="setViewMode('grid')"
//         >
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//             <rect x="3" y="3" width="7" height="7"></rect>
//             <rect x="14" y="3" width="7" height="7"></rect>
//             <rect x="14" y="14" width="7" height="7"></rect>
//             <rect x="3" y="14" width="7" height="7"></rect>
//           </svg>
//           Grid
//         </button>
//         <button 
//           class="view-btn" 
//           [class.active]="viewMode === 'list'"
//           (click)="setViewMode('list')"
//         >
//           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//             <line x1="8" y1="6" x2="21" y2="6"></line>
//             <line x1="8" y1="12" x2="21" y2="12"></line>
//             <line x1="8" y1="18" x2="21" y2="18"></line>
//             <line x1="3" y1="6" x2="3.01" y2="6"></line>
//             <line x1="3" y1="12" x2="3.01" y2="12"></line>
//             <line x1="3" y1="18" x2="3.01" y2="18"></line>
//           </svg>
//           List
//         </button>
//       </div>

//       <!-- Loading State -->
//       <div class="loading" *ngIf="loading">
//         <div class="spinner"></div>
//         <p>Loading projects...</p>
//       </div>

//       <!-- Projects Grid View -->
//       <div class="projects-grid" *ngIf="!loading && viewMode === 'grid'">
//         <div class="project-card" *ngFor="let project of filteredProjects" (click)="selectProject(project)">
//           <div class="project-header">
//             <div class="project-info">
//               <h3>{{ project.name }}</h3>
//               <p>{{ project.description }}</p>
//             </div>
//             <div class="project-status">
//               <span class="status-badge" [class]="'status-' + project.status.toLowerCase()">
//                 {{ project.status | titlecase }}
//               </span>
//               <span class="priority-badge" [class]="'priority-' + project.priority.toLowerCase()">
//                 {{ project.priority }}
//               </span>
//             </div>
//           </div>
          
//           <div class="project-progress">
//             <div class="progress-header">
//               <span>Progress</span>
//               <span class="progress-value">{{ project.progress }}%</span>
//             </div>
//             <div class="progress-bar">
//               <div class="progress-fill" [style.width.%]="project.progress"></div>
//             </div>
//           </div>
          
//           <div class="project-stats">
//             <div class="stat-item">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
//                 <polyline points="14,2 14,8 20,8"></polyline>
//               </svg>
//               <span>{{ project.tasks.length }} tasks</span>
//             </div>
//             <div class="stat-item">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//                 <circle cx="12" cy="7" r="4"></circle>
//               </svg>
//               <span>{{ project.team_members.length }} members</span>
//             </div>
//             <div class="stat-item" *ngIf="project.end_date">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//                 <line x1="16" y1="2" x2="16" y2="6"></line>
//                 <line x1="8" y1="2" x2="8" y2="6"></line>
//                 <line x1="3" y1="10" x2="21" y2="10"></line>
//               </svg>
//               <span>{{ project.end_date | date:'MMM dd, yyyy' }}</span>
//             </div>
//           </div>
          
//           <div class="project-team">
//             <div class="team-avatars">
//               <div class="avatar" *ngFor="let member of project.team_members.slice(0, 4)">
//                 {{ getInitials(member.name) }}
//               </div>
//               <div class="avatar more" *ngIf="project.team_members.length > 4">
//                 +{{ project.team_members.length - 4 }}
//               </div>
//             </div>
//             <div class="project-manager">
//               <span>PM: {{ project.manager.name }}</span>
//             </div>
//           </div>
//         </div>
        
//         <!-- Empty State -->
//         <div class="empty-state" *ngIf="filteredProjects.length === 0">
//           <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//             <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
//           </svg>
//           <h3>No projects found</h3>
//           <p>Create your first project to get started</p>
//           <button class="create-btn" (click)="openCreateModal()">Create Project</button>
//         </div>
//       </div>

//       <!-- Projects List View -->
//       <div class="projects-list" *ngIf="!loading && viewMode === 'list'">
//         <div class="list-header">
//           <div class="col-name">Project Name</div>
//           <div class="col-status">Status</div>
//           <div class="col-priority">Priority</div>
//           <div class="col-progress">Progress</div>
//           <div class="col-tasks">Tasks</div>
//           <div class="col-team">Team</div>
//           <div class="col-deadline">Deadline</div>
//           <div class="col-actions">Actions</div>
//         </div>
        
//         <div class="list-row" *ngFor="let project of filteredProjects" (click)="selectProject(project)">
//           <div class="col-name">
//             <div class="project-name-cell">
//               <h4>{{ project.name }}</h4>
//               <p>{{ project.description | slice:0:50 }}{{ project.description.length > 50 ? '...' : '' }}</p>
//             </div>
//           </div>
//           <div class="col-status">
//             <span class="status-badge" [class]="'status-' + project.status.toLowerCase()">
//               {{ project.status | titlecase }}
//             </span>
//           </div>
//           <div class="col-priority">
//             <span class="priority-badge" [class]="'priority-' + project.priority.toLowerCase()">
//               {{ project.priority }}
//             </span>
//           </div>
//           <div class="col-progress">
//             <div class="progress-cell">
//               <div class="progress-bar">
//                 <div class="progress-fill" [style.width.%]="project.progress"></div>
//               </div>
//               <span class="progress-text">{{ project.progress }}%</span>
//             </div>
//           </div>
//           <div class="col-tasks">
//             <span class="task-count">{{ project.tasks.length }}</span>
//           </div>
//           <div class="col-team">
//             <div class="team-avatars-small">
//               <div class="avatar-small" *ngFor="let member of project.team_members.slice(0, 3)">
//                 {{ getInitials(member.name) }}
//               </div>
//               <span class="team-count" *ngIf="project.team_members.length > 3">
//                 +{{ project.team_members.length - 3 }}
//               </span>
//             </div>
//           </div>
//           <div class="col-deadline">
//             <span class="deadline-date" [class]="getDeadlineClass(project.end_date)">
//               {{ project.end_date | date:'MMM dd' }}
//             </span>
//           </div>
//           <div class="col-actions">
//             <button class="action-btn" (click)="editProject(project, $event)">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
//                 <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
//               </svg>
//             </button>
//             <button class="action-btn delete" (click)="deleteProject(project, $event)">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <polyline points="3,6 5,6 21,6"></polyline>
//                 <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       <!-- Project Details Modal -->
//       <div class="modal-overlay" *ngIf="selectedProject" (click)="closeProjectModal()">
//         <div class="modal-content project-modal" (click)="$event.stopPropagation()">
//           <div class="modal-header">
//             <h2>{{ selectedProject.name }}</h2>
//             <button class="close-btn" (click)="closeProjectModal()">
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <line x1="18" y1="6" x2="6" y2="18"></line>
//                 <line x1="6" y1="6" x2="18" y2="18"></line>
//               </svg>
//             </button>
//           </div>
          
//           <div class="modal-body">
//             <div class="project-overview">
//               <div class="overview-stats">
//                 <div class="stat-card">
//                   <h3>{{ selectedProject.progress }}%</h3>
//                   <p>Completed</p>
//                 </div>
//                 <div class="stat-card">
//                   <h3>{{ selectedProject.tasks.length }}</h3>
//                   <p>Total Tasks</p>
//                 </div>
//                 <div class="stat-card">
//                   <h3>{{ getCompletedTasks(selectedProject).length }}</h3>
//                   <p>Done</p>
//                 </div>
//                 <div class="stat-card">
//                   <h3>{{ selectedProject.team_members.length }}</h3>
//                   <p>Team Members</p>
//                 </div>
//               </div>
              
//               <div class="project-details-grid">
//                 <div class="detail-section">
//                   <h4>Description</h4>
//                   <p>{{ selectedProject.description }}</p>
//                 </div>
                
//                 <div class="detail-section">
//                   <h4>Timeline</h4>
//                   <div class="timeline-info">
//                     <div class="timeline-item">
//                       <span class="label">Start Date:</span>
//                       <span>{{ selectedProject.start_date | date:'MMM dd, yyyy' }}</span>
//                     </div>
//                     <div class="timeline-item">
//                       <span class="label">End Date:</span>
//                       <span>{{ selectedProject.end_date | date:'MMM dd, yyyy' }}</span>
//                     </div>
//                     <div class="timeline-item">
//                       <span class="label">Duration:</span>
//                       <span>{{ getProjectDuration(selectedProject) }} days</span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div class="detail-section">
//                   <h4>Team</h4>
//                   <div class="team-list">
//                     <div class="team-member" *ngFor="let member of selectedProject.team_members">
//                       <div class="member-avatar">{{ getInitials(member.name) }}</div>
//                       <div class="member-info">
//                         <span class="member-name">{{ member.name }}</span>
//                         <span class="member-role">{{ member.role | titlecase }}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div class="detail-section" *ngIf="selectedProject.budget">
//                   <h4>Budget</h4>
//                   <div class="budget-info">
//                     <div class="budget-item">
//                       <span class="label">Total Budget:</span>
//                       <span class="amount">${{ selectedProject.budget | number:'1.0-0' }}</span>
//                     </div>
//                     <div class="budget-item" *ngIf="selectedProject.spent">
//                       <span class="label">Spent:</span>
//                       <span class="amount">${{ selectedProject.spent | number:'1.0-0' }}</span>
//                     </div>
//                     <div class="budget-item" *ngIf="selectedProject.spent && selectedProject.budget">
//                       <span class="label">Remaining:</span>
//                       <span class="amount">${{ (selectedProject.budget - selectedProject.spent) | number:'1.0-0' }}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
              
//               <div class="tasks-section">
//                 <h4>Project Tasks</h4>
//                 <div class="task-list">
//                   <div class="task-item" *ngFor="let task of selectedProject.tasks">
//                     <div class="task-info">
//                       <h5>{{ task.title }}</h5>
//                       <p>{{ task.description }}</p>
//                       <div class="task-meta">
//                         <span class="status" [class]="'status-' + task.status.toLowerCase()">
//                           {{ task.status | titlecase }}
//                         </span>
//                         <span class="priority" [class]="'priority-' + task.priority.toLowerCase()">
//                           {{ task.priority }}
//                         </span>
//                         <span class="assignee" *ngIf="task.assigned_to">
//                           {{ task.assigned_to.name }}
//                         </span>
//                       </div>
//                     </div>
//                     <div class="task-due" *ngIf="task.due_date">
//                       {{ task.due_date | date:'MMM dd' }}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- Create/Edit Project Modal -->
//       <div class="modal-overlay" *ngIf="showCreateModal" (click)="closeCreateModal()">
//         <div class="modal-content create-modal" (click)="$event.stopPropagation()">
//           <div class="modal-header">
//             <h2>{{ editingProject ? 'Edit Project' : 'Create New Project' }}</h2>
//             <button class="close-btn" (click)="closeCreateModal()">
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <line x1="18" y1="6" x2="6" y2="18"></line>
//                 <line x1="6" y1="6" x2="18" y2="18"></line>
//               </svg>
//             </button>
//           </div>
          
//           <div class="modal-body">
//             <form [formGroup]="projectForm" (ngSubmit)="saveProject()">
//               <div class="form-row">
//                 <div class="form-group">
//                   <label for="name">Project Name *</label>
//                   <input 
//                     type="text" 
//                     id="name" 
//                     formControlName="name"
//                     placeholder="Enter project name"
//                   >
//                   <div class="error" *ngIf="projectForm.get('name')?.invalid && projectForm.get('name')?.touched">
//                     Project name is required
//                   </div>
//                 </div>
                
//                 <div class="form-group">
//                   <label for="status">Status</label>
//                   <select id="status" formControlName="status">
//                     <option value="PLANNING">Planning</option>
//                     <option value="ACTIVE">Active</option>
//                     <option value="ON_HOLD">On Hold</option>
//                     <option value="COMPLETED">Completed</option>
//                     <option value="CANCELLED">Cancelled</option>
//                   </select>
//                 </div>
//               </div>
              
//               <div class="form-group">
//                 <label for="description">Description</label>
//                 <textarea 
//                   id="description" 
//                   formControlName="description"
//                   rows="3"
//                   placeholder="Describe your project"
//                 ></textarea>
//               </div>
              
//               <div class="form-row">
//                 <div class="form-group">
//                   <label for="priority">Priority</label>
//                   <select id="priority" formControlName="priority">
//                     <option value="HIGH">High</option>
//                     <option value="MEDIUM">Medium</option>
//                     <option value="LOW">Low</option>
//                   </select>
//                 </div>
                
//                 <div class="form-group">
//                   <label for="budget">Budget ($)</label>
//                   <input 
//                     type="number" 
//                     id="budget" 
//                     formControlName="budget"
//                     placeholder="0"
//                   >
//                 </div>
//               </div>
              
//               <div class="form-row">
//                 <div class="form-group">
//                   <label for="start_date">Start Date</label>
//                   <input 
//                     type="date" 
//                     id="start_date" 
//                     formControlName="start_date"
//                   >
//                 </div>
                
//                 <div class="form-group">
//                   <label for="end_date">End Date</label>
//                   <input 
//                     type="date" 
//                     id="end_date" 
//                     formControlName="end_date"
//                   >
//                 </div>
//               </div>
              
//               <div class="form-actions">
//                 <button type="button" class="cancel-btn" (click)="closeCreateModal()">
//                   Cancel
//                 </button>
//                 <button type="submit" class="save-btn" [disabled]="projectForm.invalid">
//                   {{ editingProject ? 'Update' : 'Create' }} Project
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   styles: [`
//     .projects-container {
//       padding: 20px;
//       max-width: 1400px;
//       margin: 0 auto;
//     }

//     .projects-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: flex-start;
//       margin-bottom: 30px;
//     }

//     .header-title h1 {
//       margin: 0 0 8px 0;
//       font-size: 32px;
//       font-weight: 700;
//       color: #333;
//     }

//     .header-title p {
//       margin: 0;
//       color: #666;
//       font-size: 16px;
//     }

//     .header-actions {
//       display: flex;
//       gap: 12px;
//     }

//     .filter-btn, .create-btn {
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       padding: 12px 20px;
//       border: none;
//       border-radius: 8px;
//       cursor: pointer;
//       font-size: 14px;
//       font-weight: 500;
//       transition: all 0.2s;
//     }

//     .filter-btn {
//       background: #f8f9fa;
//       color: #495057;
//       border: 1px solid #dee2e6;
//     }

//     .filter-btn:hover {
//       background: #e9ecef;
//     }

//     .create-btn {
//       background: #007bff;
//       color: white;
//     }

//     .create-btn:hover {
//       background: #0056b3;
//     }

//     .filters-panel {
//       background: white;
//       border: 1px solid #dee2e6;
//       border-radius: 8px;
//       padding: 20px;
//       margin-bottom: 20px;
//       display: none;
//       grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//       gap: 20px;
//     }

//     .filters-panel.active {
//       display: grid;
//     }

//     .filter-group {
//       display: flex;
//       flex-direction: column;
//       gap: 8px;
//     }

//     .filter-group label {
//       font-weight: 500;
//       color: #333;
//       font-size: 14px;
//     }

//     .filter-group select,
//     .filter-group input {
//       padding: 8px 12px;
//       border: 1px solid #dee2e6;
//       border-radius: 6px;
//       font-size: 14px;
//     }

//     .filter-actions {
//       display: flex;
//       align-items: end;
//     }

//     .clear-btn {
//       background: none;
//       border: 1px solid #dc3545;
//       color: #dc3545;
//       padding: 8px 16px;
//       border-radius: 6px;
//       cursor: pointer;
//       font-size: 14px;
//       transition: all 0.2s;
//     }

//     .clear-btn:hover {
//       background: #dc3545;
//       color: white;
//     }

//     .view-toggle {
//       display: flex;
//       gap: 0;
//       margin-bottom: 20px;
//       background: white;
//       border: 1px solid #dee2e6;
//       border-radius: 8px;
//       padding: 4px;
//       width: fit-content;
//     }

//     .view-btn {
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       padding: 8px 16px;
//       background: none;
//       border: none;
//       border-radius: 6px;
//       cursor: pointer;
//       font-size: 14px;
//       color: #666;
//       transition: all 0.2s;
//     }

//     .view-btn.active {
//       background: #007bff;
//       color: white;
//     }

//     .loading {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       justify-content: center;
//       padding: 60px 20px;
//       color: #666;
//     }

//     .spinner {
//       width: 40px;
//       height: 40px;
//       border: 4px solid #f3f3f3;
//       border-top: 4px solid #007bff;
//       border-radius: 50%;
//       animation: spin 1s linear infinite;
//       margin-bottom: 20px;
//     }

//     @keyframes spin {
//       0% { transform: rotate(0deg); }
//       100% { transform: rotate(360deg); }
//     }

//     .projects-grid {
//       display: grid;
//       grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
//       gap: 24px;
//     }

//     .project-card {
//       background: white;
//       border: 1px solid #dee2e6;
//       border-radius: 12px;
//       padding: 24px;
//       cursor: pointer;
//       transition: all 0.3s ease;
//       position: relative;
//       overflow: hidden;
//     }

//     .project-card:hover {
//       transform: translateY(-4px);
//       box-shadow: 0 8px 25px rgba(0,0,0,0.15);
//       border-color: #007bff;
//     }

//     .project-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: flex-start;
//       margin-bottom: 20px;
//     }

//     .project-info h3 {
//       margin: 0 0 8px 0;
//       font-size: 20px;
//       font-weight: 600;
//       color: #333;
//     }

//     .project-info p {
//       margin: 0;
//       color: #666;
//       font-size: 14px;
//       line-height: 1.4;
//     }

//     .project-status {
//       display: flex;
//       flex-direction: column;
//       gap: 8px;
//       align-items: flex-end;
//     }

//     .status-badge, .priority-badge {
//       padding: 4px 12px;
//       border-radius: 20px;
//       font-size: 12px;
//       font-weight: 600;
//       text-transform: uppercase;
//       letter-spacing: 0.5px;
//     }

//     .status-planning {
//       background: #fff3cd;
//       color: #856404;
//     }

//     .status-active {
//       background: #d1ecf1;
//       color: #0c5460;
//     }

//     .status-on_hold {
//       background: #f8d7da;
//       color: #721c24;
//     }

//     .status-completed {
//       background: #d4edda;
//       color: #155724;
//     }

//     .status-cancelled {
//       background: #f5c6cb;
//       color: #721c24;
//     }

//     .priority-high {
//       background: #f8d7da;
//       color: #721c24;
//     }

//     .priority-medium {
//       background: #fff3cd;
//       color: #856404;
//     }

//     .priority-low {
//       background: #d4edda;
//       color: #155724;
//     }

//     .project-progress {
//       margin-bottom: 20px;
//     }

//     .progress-header {
//       display: flex;
//       justify-content: space-between;
//       margin-bottom: 8px;
//     }

//     .progress-header span {
//       font-size: 14px;
//       font-weight: 500;
//       color: #333;
//     }

//     .progress-value {
//       color: #007bff !important;
//       font-weight: 600 !important;
//     }

//     .progress-bar {
//       height: 8px;
//       background: #e9ecef;
//       border-radius: 4px;
//       overflow: hidden;
//     }

//     .progress-fill {
//       height: 100%;
//       background: linear-gradient(90deg, #007bff, #0056b3);
//       border-radius: 4px;
//       transition: width 0.5s ease;
//     }

//     .project-stats {
//       display: flex;
//       justify-content: space-between;
//       margin-bottom: 20px;
//       padding: 16px 0;
//       border-top: 1px solid #f1f3f4;
//       border-bottom: 1px solid #f1f3f4;
//     }

//     .stat-item {
//       display: flex;
//       align-items: center;
//       gap: 6px;
//       font-size: 13px;
//       color: #666;
//     }

//     .stat-item svg {
//       opacity: 0.7;
//     }

//     .project-team {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//     }

//     .team-avatars {
//       display: flex;
//       gap: -8px;
//     }

//     .avatar {
//       width: 32px;
//       height: 32px;
//       border-radius: 50%;
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       color: white;
//       font-size: 12px;
//       font-weight: 600;
//       border: 2px solid white;
//       margin-left: -8px;
//     }

//     .avatar:first-child {
//       margin-left: 0;
//     }

//     .avatar.more {
//       background: #6c757d;
//       font-size: 10px;
//     }

//     .project-manager {
//       font-size: 12px;
//       color: #666;
//     }

//     .empty-state {
//       grid-column: 1 / -1;
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       justify-content: center;
//       padding: 60px 20px;
//       color: #666;
//       text-align: center;
//     }

//     .empty-state svg {
//       margin-bottom: 20px;
//       opacity: 0.5;
//     }

//     .empty-state h3 {
//       margin: 0 0 8px 0;
//       font-size: 20px;
//       color: #333;
//     }

//     .empty-state p {
//       margin: 0 0 24px 0;
//     }

//     .projects-list {
//       background: white;
//       border: 1px solid #dee2e6;
//       border-radius: 8px;
//       overflow: hidden;
//     }

//     .list-header {
//       display: grid;
//       grid-template-columns: 2fr 1fr 1fr 1fr 80px 120px 100px 80px;
//       padding: 16px 20px;
//       background: #f8f9fa;
//       border-bottom: 1px solid #dee2e6;
//       font-weight: 600;
//       font-size: 14px;
//       color: #666;
//     }

//     .list-row {
//       display: grid;
//       grid-template-columns: 2fr 1fr 1fr 1fr 80px 120px 100px 80px;
//       padding: 16px 20px;
//       border-bottom: 1px solid #f1f3f4;
//       align-items: center;
//       cursor: pointer;
//       transition: background 0.2s;
//     }

//     .list-row:hover {
//       background: #f8f9fa;
//     }

//     .list-row:last-child {
//       border-bottom: none;
//     }

//     .project-name-cell h4 {
//       margin: 0 0 4px 0;
//       font-size: 16px;
//       font-weight: 600;
//       color: #333;
//     }

//     .project-name-cell p {
//       margin: 0;
//       font-size: 13px;
//       color: #666;
//     }

//     .progress-cell {
//       display: flex;
//       align-items: center;
//       gap: 8px;
//     }

//     .progress-cell .progress-bar {
//       flex: 1;
//       height: 6px;
//     }

//     .progress-text {
//       font-size: 12px;
//       font-weight: 600;
//       color: #333;
//       min-width: 35px;
//     }

//     .task-count {
//       font-weight: 600;
//       color: #333;
//     }

//     .team-avatars-small {
//       display: flex;
//       align-items: center;
//       gap: 4px;
//     }

//     .avatar-small {
//       width: 24px;
//       height: 24px;
//       border-radius: 50%;
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       color: white;
//       font-size: 10px;
//       font-weight: 600;
//     }

//     .team-count {
//       font-size: 12px;
//       color: #666;
//       margin-left: 4px;
//     }

//     .deadline-date {
//       font-size: 13px;
//       font-weight: 500;
//     }

//     .deadline-date.overdue {
//       color: #dc3545;
//     }

//     .deadline-date.urgent {
//       color: #fd7e14;
//     }

//     .deadline-date.normal {
//       color: #28a745;
//     }

//     .action-btn {
//       background: none;
//       border: 1px solid #dee2e6;
//       border-radius: 4px;
//       padding: 6px;
//       cursor: pointer;
//       color: #666;
//       transition: all 0.2s;
//       margin-right: 4px;
//     }

//     .action-btn:hover {
//       background: #f8f9fa;
//       border-color: #007bff;
//       color: #007bff;
//     }

//     .action-btn.delete:hover {
//       border-color: #dc3545;
//       color: #dc3545;
//     }

//     .modal-overlay {
//       position: fixed;
//       top: 0;
//       left: 0;
//       right: 0;
//       bottom: 0;
//       background: rgba(0, 0, 0, 0.5);
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       z-index: 1000;
//       padding: 20px;
//     }

//     .modal-content {
//       background: white;
//       border-radius: 12px;
//       max-height: 90vh;
//       overflow-y: auto;
//       width: 100%;
//       position: relative;
//     }

//     .project-modal {
//       max-width: 900px;
//     }

//     .create-modal {
//       max-width: 600px;
//     }

//     .modal-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       padding: 24px;
//       border-bottom: 1px solid #dee2e6;
//     }

//     .modal-header h2 {
//       margin: 0;
//       font-size: 24px;
//       font-weight: 600;
//       color: #333;
//     }

//     .close-btn {
//       background: none;
//       border: none;
//       cursor: pointer;
//       color: #666;
//       padding: 4px;
//       transition: color 0.2s;
//     }

//     .close-btn:hover {
//       color: #333;
//     }

//     .modal-body {
//       padding: 24px;
//     }

//     .overview-stats {
//       display: grid;
//       grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
//       gap: 20px;
//       margin-bottom: 30px;
//     }

//     .stat-card {
//       background: #f8f9fa;
//       padding: 20px;
//       border-radius: 8px;
//       text-align: center;
//     }

//     .stat-card h3 {
//       margin: 0 0 8px 0;
//       font-size: 28px;
//       font-weight: 700;
//       color: #007bff;
//     }

//     .stat-card p {
//       margin: 0;
//       color: #666;
//       font-size: 14px;
//     }

//     .project-details-grid {
//       display: grid;
//       grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//       gap: 30px;
//       margin-bottom: 30px;
//     }

//     .detail-section h4 {
//       margin: 0 0 16px 0;
//       font-size: 18px;
//       font-weight: 600;
//       color: #333;
//     }

//     .detail-section p {
//       margin: 0;
//       color: #666;
//       line-height: 1.5;
//     }

//     .timeline-info {
//       display: flex;
//       flex-direction: column;
//       gap: 12px;
//     }

//     .timeline-item {
//       display: flex;
//       justify-content: space-between;
//       padding: 8px 0;
//       border-bottom: 1px solid #f1f3f4;
//     }

//     .timeline-item:last-child {
//       border-bottom: none;
//     }

//     .timeline-item .label {
//       font-weight: 500;
//       color: #333;
//     }

//     .team-list {
//       display: flex;
//       flex-direction: column;
//       gap: 12px;
//     }

//     .team-member {
//       display: flex;
//       align-items: center;
//       gap: 12px;
//       padding: 8px 0;
//     }

//     .member-avatar {
//       width: 40px;
//       height: 40px;
//       border-radius: 50%;
//       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       color: white;
//       font-weight: 600;
//       font-size: 14px;
//     }

//     .member-info {
//       display: flex;
//       flex-direction: column;
//       gap: 2px;
//     }

//     .member-name {
//       font-weight: 500;
//       color: #333;
//     }

//     .member-role {
//       font-size: 12px;
//       color: #666;
//     }

//     .budget-info {
//       display: flex;
//       flex-direction: column;
//       gap: 12px;
//     }

//     .budget-item {
//       display: flex;
//       justify-content: space-between;
//       padding: 8px 0;
//       border-bottom: 1px solid #f1f3f4;
//     }

//     .budget-item:last-child {
//       border-bottom: none;
//     }

//     .budget-item .label {
//       font-weight: 500;
//       color: #333;
//     }

//     .amount {
//       font-weight: 600;
//       color: #007bff;
//     }

//     .tasks-section h4 {
//       margin: 0 0 20px 0;
//       font-size: 18px;
//       font-weight: 600;
//       color: #333;
//     }

//     .task-list {
//       display: flex;
//       flex-direction: column;
//       gap: 16px;
//       max-height: 400px;
//       overflow-y: auto;
//     }

//     .task-item {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       padding: 16px;
//       border: 1px solid #dee2e6;
//       border-radius: 8px;
//       transition: all 0.2s;
//     }

//     .task-item:hover {
//       box-shadow: 0 2px 8px rgba(0,0,0,0.1);
//     }

//     .task-info h5 {
//       margin: 0 0 4px 0;
//       font-size: 16px;
//       font-weight: 600;
//       color: #333;
//     }

//     .task-info p {
//       margin: 0 0 8px 0;
//       color: #666;
//       font-size: 14px;
//     }

//     .task-meta {
//       display: flex;
//       gap: 8px;
//       align-items: center;
//     }

//     .task-meta .status,
//     .task-meta .priority {
//       padding: 2px 8px;
//       border-radius: 12px;
//       font-size: 11px;
//       font-weight: 600;
//       text-transform: uppercase;
//     }

//     .assignee {
//       font-size: 12px;
//       color: #666;
//       background: #f8f9fa;
//       padding: 4px 8px;
//       border-radius: 12px;
//     }

//     .task-due {
//       font-size: 12px;
//       color: #666;
//       font-weight: 500;
//     }

//     .form-row {
//       display: grid;
//       grid-template-columns: 1fr 1fr;
//       gap: 20px;
//       margin-bottom: 20px;
//     }

//     .form-group {
//       display: flex;
//       flex-direction: column;
//       gap: 8px;
//     }

//     .form-group label {
//       font-weight: 500;
//       color: #333;
//       font-size: 14px;
//     }

//     .form-group input,
//     .form-group select,
//     .form-group textarea {
//       padding: 12px;
//       border: 1px solid #dee2e6;
//       border-radius: 6px;
//       font-size: 14px;
//       transition: border-color 0.2s;
//     }

//     .form-group input:focus,
//     .form-group select:focus,
//     .form-group textarea:focus {
//       outline: none;
//       border-color: #007bff;
//     }

//     .form-group textarea {
//       resize: vertical;
//       min-height: 80px;
//     }

//     .error {
//       color: #dc3545;
//       font-size: 12px;
//       margin-top: 4px;
//     }

//     .form-actions {
//       display: flex;
//       justify-content: flex-end;
//       gap: 12px;
//       margin-top: 30px;
//       padding-top: 20px;
//       border-top: 1px solid #dee2e6;
//     }

//     .cancel-btn, .save-btn {
//       padding: 12px 24px;
//       border-radius: 6px;
//       font-size: 14px;
//       font-weight: 500;
//       cursor: pointer;
//       transition: all 0.2s;
//     }

//     .cancel-btn {
//       background: none;
//       border: 1px solid #dee2e6;
//       color: #666;
//     }

//     .cancel-btn:hover {
//       background: #f8f9fa;
//     }

//     .save-btn {
//       background: #007bff;
//       border: 1px solid #007bff;
//       color: white;
//     }

//     .save-btn:hover:not(:disabled) {
//       background: #0056b3;
//     }

//     .save-btn:disabled {
//       opacity: 0.6;
//       cursor: not-allowed;
//     }

//     @media (max-width: 768px) {
//       .projects-header {
//         flex-direction: column;
//         gap: 20px;
//       }

//       .header-actions {
//         flex-direction: column;
//         width: 100%;
//       }

//       .filters-panel {
//         grid-template-columns: 1fr;
//       }

//       .projects-grid {
//         grid-template-columns: 1fr;
//       }

//       .list-header,
//       .list-row {
//         grid-template-columns: 2fr 1fr 1fr;
//         font-size: 12px;
//       }

//       .col-priority,
//       .col-tasks,
//       .col-team,
//       .col-deadline,
//       .col-actions {
//         display: none;
//       }

//       .project-details-grid {
//         grid-template-columns: 1fr;
//       }

//       .form-row {
//         grid-template-columns: 1fr;
//       }

//       .modal-content {
//         margin: 10px;
//         max-height: calc(100vh - 20px);
//       }
//     }
//   `]
// })
// export class ProjectsComponent implements OnInit {
//   projects: Project[] = [];
//   filteredProjects: Project[] = [];
//   loading = true;
//   viewMode: 'grid' | 'list' = 'grid';
//   showFilters = false;
  
//   filters = {
//     status: '',
//     priority: '',
//     search: ''
//   };
  
//   selectedProject: Project | null = null;
//   showCreateModal = false;
//   editingProject: Project | null = null;
  
//   projectForm: FormGroup;
  
//   // Mock users for demonstration
//   mockUsers: User[] = [
//     { id: 1, name: 'John Doe', email: 'john@example.com', role: 'MANAGER' },
//     { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'EMPLOYEE' },
//     { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'EMPLOYEE' }
//   ];

//   constructor(
//     private taskService: TaskService,
//     private fb: FormBuilder
//   ) {
//     this.projectForm = this.fb.group({
//       name: ['', Validators.required],
//       description: [''],
//       status: ['PLANNING'],
//       priority: ['MEDIUM'],
//       start_date: [''],
//       end_date: [''],
//       budget: [0]
//     });
//   }

//   ngOnInit() {
//     this.loadProjects();
//   }

//   loadProjects() {
//     this.loading = true;
    
//     // Since we don't have a real projects API, we'll create mock projects
//     // In a real app, you'd call this.projectService.getAllProjects()
//     this.taskService.getAllTasks().subscribe({
//       next: (tasks) => {
//         this.projects = this.generateMockProjects(tasks);
//         this.filteredProjects = [...this.projects];
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error loading projects:', error);
//         this.loading = false;
//       }
//     });
//   }

//   generateMockProjects(tasks: Task[]): Project[] {
//     const mockProjects: Project[] = [
//       {
//         id: 1,
//         name: 'E-commerce Platform',
//         description: 'Build a modern e-commerce platform with React and Node.js',
//         status: 'ACTIVE',
//         priority: 'HIGH',
//         start_date: '2024-01-15',
//         end_date: '2024-06-30',
//         manager: this.mockUsers[0],
//         team_members: this.mockUsers,
//         tasks: tasks.slice(0, 8),
//         progress: 65,
//         budget: 150000,
//         spent: 97500
//       },
//       {
//         id: 2,
//         name: 'Mobile App Development',
//         description: 'Cross-platform mobile application using React Native',
//         status: 'PLANNING',
//         priority: 'MEDIUM',
//         start_date: '2024-03-01',
//         end_date: '2024-09-15',
//         manager: this.mockUsers[1],
//         team_members: [this.mockUsers[1], this.mockUsers[2]],
//         tasks: tasks.slice(8, 12),
//         progress: 25,
//         budget: 80000,
//         spent: 15000
//       },
//       {
//         id: 3,
//         name: 'Data Analytics Dashboard',
//         description: 'Business intelligence dashboard with real-time analytics',
//         status: 'COMPLETED',
//         priority: 'LOW',
//         start_date: '2023-10-01',
//         end_date: '2024-01-31',
//         manager: this.mockUsers[2],
//         team_members: [this.mockUsers[0], this.mockUsers[2]],
//         tasks: tasks.slice(12, 16),
//         progress: 100,
//         budget: 50000,
//         spent: 48000
//       },
//       {
//         id: 4,
//         name: 'API Modernization',
//         description: 'Migrate legacy APIs to microservices architecture',
//         status: 'ON_HOLD',
//         priority: 'HIGH',
//         start_date: '2024-02-01',
//         end_date: '2024-08-31',
//         manager: this.mockUsers[0],
//         team_members: this.mockUsers,
//         tasks: tasks.slice(16, 20),
//         progress: 40,
//         budget: 120000,
//         spent: 35000
//       }
//     ];

//     return mockProjects;
//   }

//   toggleFilters() {
//     this.showFilters = !this.showFilters;
//   }

//   setViewMode(mode: 'grid' | 'list') {
//     this.viewMode = mode;
//   }

//   applyFilters() {
//     this.filteredProjects = this.projects.filter(project => {
//       const matchesStatus = !this.filters.status || project.status === this.filters.status;
//       const matchesPriority = !this.filters.priority || project.priority === this.filters.priority;
//       const matchesSearch = !this.filters.search || 
//         project.name.toLowerCase().includes(this.filters.search.toLowerCase()) ||
//         project.description.toLowerCase().includes(this.filters.search.toLowerCase());
      
//       return matchesStatus && matchesPriority && matchesSearch;
//     });
//   }

//   clearFilters() {
//     this.filters = {
//       status: '',
//       priority: '',
//       search: ''
//     };
//     this.filteredProjects = [...this.projects];
//   }

//   selectProject(project: Project) {
//     this.selectedProject = project;
//   }

//   closeProjectModal() {
//     this.selectedProject = null;
//   }

//   openCreateModal() {
//     this.showCreateModal = true;
//     this.editingProject = null;
//     this.projectForm.reset({
//       status: 'PLANNING',
//       priority: 'MEDIUM'
//     });
//   }

//   closeCreateModal() {
//     this.showCreateModal = false;
//     this.editingProject = null;
//     this.projectForm.reset();
//   }

//   editProject(project: Project, event: Event) {
//     event.stopPropagation();
//     this.editingProject = project;
//     this.showCreateModal = true;
    
//     this.projectForm.patchValue({
//       name: project.name,
//       description: project.description,
//       status: project.status,
//       priority: project.priority,
//       start_date: project.start_date,
//       end_date: project.end_date,
//       budget: project.budget
//     });
//   }

//   deleteProject(project: Project, event: Event) {
//     event.stopPropagation();
    
//     if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
//       this.projects = this.projects.filter(p => p.id !== project.id);
//       this.applyFilters();
//     }
//   }

//   saveProject() {
//     if (this.projectForm.valid) {
//       const formValue = this.projectForm.value;
      
//       if (this.editingProject) {
//         // Update existing project
//         const index = this.projects.findIndex(p => p.id === this.editingProject!.id);
//         if (index !== -1) {
//           this.projects[index] = {
//             ...this.editingProject,
//             ...formValue
//           };
//         }
//       } else {
//         // Create new project
//         const newProject: Project = {
//           id: Math.max(...this.projects.map(p => p.id)) + 1,
//           ...formValue,
//           manager: this.mockUsers[0],
//           team_members: [this.mockUsers[0]],
//           tasks: [],
//           progress: 0,
//           spent: 0
//         };
//         this.projects.push(newProject);
//       }
      
//       this.applyFilters();
//       this.closeCreateModal();
//     }
//   }

//   getInitials(name: string): string {
//     return name
//       .split(' ')
//       .map(n => n[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   }

//   getCompletedTasks(project: Project): Task[] {
//     return project.tasks.filter(task => task.status === 'COMPLETED');
//   }

//   getProjectDuration(project: Project): number {
//     const start = new Date(project.start_date);
//     const end = new Date(project.end_date);
//     const diffTime = Math.abs(end.getTime() - start.getTime());
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   }

//   getDeadlineClass(endDate: string): string {
//     const now = new Date();
//     const deadline = new Date(endDate);
//     const diffTime = deadline.getTime() - now.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays < 0) {
//       return 'overdue';
//     } else if (diffDays <= 7) {
//       return 'urgent';
//     } else {
//       return 'normal';
//     }
//   }
// }