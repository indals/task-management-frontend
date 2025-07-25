// src/app/core/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { ErrorHandlerService } from './error-handler.service';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface CreateProjectRequest {
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  budget?: number;
  client?: string;
  manager_id?: number;
  team_members?: number[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  budget?: number;
  client?: string;
  manager_id?: number;
  progress?: number;
}

export interface ProjectFilters {
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  manager_id?: number;
  member_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProjectMember {
  id: number;
  user: User;
  role: 'MANAGER' | 'MEMBER' | 'VIEWER';
  joined_date: string;
  permissions?: string[];
}

export interface AddMemberRequest {
  user_id: number;
  role: 'MANAGER' | 'MEMBER' | 'VIEWER';
  permissions?: string[];
}

export interface UpdateMemberRequest {
  role?: 'MANAGER' | 'MEMBER' | 'VIEWER';
  permissions?: string[];
}

export interface ProjectStatistics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  total_members: number;
  active_members: number;
  budget_used: number;
  days_remaining: number;
  is_overdue: boolean;
  progress_percentage: number;
  task_distribution: {
    low_priority: number;
    medium_priority: number;
    high_priority: number;
  };
  member_workload: {
    user_id: number;
    name: string;
    assigned_tasks: number;
    completed_tasks: number;
    workload_percentage: number;
  }[];
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  private currentProjectSubject = new BehaviorSubject<Project | null>(null);
  public currentProject$ = this.currentProjectSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Get all projects with filters
  getProjects(filters?: ProjectFilters): Observable<PaginatedResponse<Project>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ProjectFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Project>>(API_ENDPOINTS.PROJECTS.BASE, { params })
      .pipe(
        tap(response => this.projectsSubject.next(response.data)),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Get recent projects
  getRecentProjects(limit: number = 5): Observable<Project[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<Project[]>(`${API_ENDPOINTS.PROJECTS.BASE}/recent`, { params })
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Get project by ID
  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(API_ENDPOINTS.PROJECTS.BY_ID(id))
      .pipe(
        tap(project => this.currentProjectSubject.next(project)),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Create project
  createProject(project: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(API_ENDPOINTS.PROJECTS.BASE, project)
      .pipe(
        tap(() => this.refreshProjects()),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Update project
  updateProject(id: number, project: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(API_ENDPOINTS.PROJECTS.BY_ID(id), project)
      .pipe(
        tap(updatedProject => {
          this.currentProjectSubject.next(updatedProject);
          this.refreshProjects();
        }),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Delete project
  deleteProject(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.PROJECTS.BY_ID(id))
      .pipe(
        tap(() => {
          this.currentProjectSubject.next(null);
          this.refreshProjects();
        }),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Project Members Management
  getProjectMembers(projectId: number): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(API_ENDPOINTS.PROJECTS.MEMBERS(projectId))
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  addProjectMember(projectId: number, memberData: AddMemberRequest): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(API_ENDPOINTS.PROJECTS.MEMBERS(projectId), memberData)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  updateProjectMember(projectId: number, userId: number, memberData: UpdateMemberRequest): Observable<ProjectMember> {
    return this.http.put<ProjectMember>(`${API_ENDPOINTS.PROJECTS.MEMBERS(projectId)}/${userId}`, memberData)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  removeProjectMember(projectId: number, userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_ENDPOINTS.PROJECTS.MEMBERS(projectId)}/${userId}`)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Project Tasks Management
  getProjectTasks(projectId: number, filters?: any): Observable<Task[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Task[]>(API_ENDPOINTS.PROJECTS.TASKS(projectId), { params })
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Project Statistics
  getProjectStatistics(projectId: number): Observable<ProjectStatistics> {
    return this.http.get<ProjectStatistics>(API_ENDPOINTS.PROJECTS.STATISTICS(projectId))
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Project Progress
  updateProjectProgress(projectId: number, progress: number): Observable<Project> {
    return this.http.patch<Project>(`${API_ENDPOINTS.PROJECTS.BY_ID(projectId)}/progress`, { progress })
      .pipe(
        tap(project => this.currentProjectSubject.next(project)),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Archive project
  archiveProject(projectId: number): Observable<Project> {
    return this.http.post<Project>(`${API_ENDPOINTS.PROJECTS.BY_ID(projectId)}/archive`, {})
      .pipe(
        tap(() => this.refreshProjects()),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Restore archived project
  restoreProject(projectId: number): Observable<Project> {
    return this.http.post<Project>(`${API_ENDPOINTS.PROJECTS.BY_ID(projectId)}/restore`, {})
      .pipe(
        tap(() => this.refreshProjects()),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Duplicate project
  duplicateProject(projectId: number, newName: string): Observable<Project> {
    return this.http.post<Project>(`${API_ENDPOINTS.PROJECTS.BY_ID(projectId)}/duplicate`, { 
      name: newName 
    }).pipe(
      tap(() => this.refreshProjects()),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Export project data
  exportProject(projectId: number, format: 'pdf' | 'excel' = 'pdf'): Observable<Blob> {
    const params = new HttpParams().set('format', format);
    
    return this.http.get(`${API_ENDPOINTS.PROJECTS.BY_ID(projectId)}/export`, { 
      params, 
      responseType: 'blob' 
    }).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Get project timeline
  getProjectTimeline(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_ENDPOINTS.PROJECTS.BY_ID(projectId)}/timeline`)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Get project activity log
  getProjectActivityLog(projectId: number, limit: number = 50): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<any[]>(`${API_ENDPOINTS.PROJECTS.BY_ID(projectId)}/activity`, { params })
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Search projects
  searchProjects(query: string, filters?: ProjectFilters): Observable<Project[]> {
    let params = new HttpParams().set('q', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ProjectFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Project[]>(`${API_ENDPOINTS.PROJECTS.BASE}/search`, { params })
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Get projects by status
  getProjectsByStatus(status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED'): Observable<Project[]> {
    return this.getProjects({ status }).pipe(
      map(response => response.data)
    );
  }

  // Get user's projects
  getUserProjects(userId?: number): Observable<Project[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('user_id', userId.toString());
    }
    
    return this.http.get<Project[]>(`${API_ENDPOINTS.PROJECTS.BASE}/user`, { params })
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Get project dashboard data
  getProjectDashboard(projectId: number): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.PROJECTS.BY_ID(projectId)}/dashboard`)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Helper method to refresh projects
  private refreshProjects(): void {
    this.getProjects().subscribe();
  }

  // Get current projects from subject
  getCurrentProjects(): Project[] {
    return this.projectsSubject.value;
  }

  // Get current project from subject
  getCurrentProject(): Project | null {
    return this.currentProjectSubject.value;
  }

  // Set current project
  setCurrentProject(project: Project): void {
    this.currentProjectSubject.next(project);
  }

  // Clear current project
  clearCurrentProject(): void {
    this.currentProjectSubject.next(null);
  }
}