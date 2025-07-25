// src/app/core/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { 
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectContributor,
  AddContributorRequest,
  ProjectFilters,
  ProjectStats,
  ProjectApiResponse,
  ProjectStatus
} from '../models/project.model';
import { User } from '../models/user.model';
import { ErrorHandlerService } from './error-handler.service';
import { API_ENDPOINTS } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  public projects$ = this.projectsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Helper method to build HTTP params from filters
  private buildHttpParams(filters?: ProjectFilters): HttpParams {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.created_by) params = params.set('created_by', filters.created_by.toString());
      if (filters.contributor) params = params.set('contributor', filters.contributor);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params = params.append('tags', tag));
      }
      if (filters.start_date_from) params = params.set('start_date_from', filters.start_date_from);
      if (filters.start_date_to) params = params.set('start_date_to', filters.start_date_to);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
      if (filters.sort_order) params = params.set('sort_order', filters.sort_order);
    }

    return params;
  }

  // Get all projects with optional filters
  getProjects(filters?: ProjectFilters): Observable<Project[]> {
    this.loadingSubject.next(true);
    const params = this.buildHttpParams(filters);

    return this.http.get<ProjectApiResponse>(API_ENDPOINTS.PROJECTS.BASE, { params }).pipe(
      map(response => {
        const projects = Array.isArray(response.data) ? response.data : [response.data];
        return projects as Project[];
      }),
      tap(projects => {
        this.projectsSubject.next(projects);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Get projects by username
  getProjectsByUsername(username: string, filters?: ProjectFilters): Observable<Project[]> {
    this.loadingSubject.next(true);
    const params = this.buildHttpParams(filters);

    return this.http.get<ProjectApiResponse>(API_ENDPOINTS.PROJECTS.BY_USERNAME(username), { params }).pipe(
      map(response => {
        const projects = Array.isArray(response.data) ? response.data : [response.data];
        return projects as Project[];
      }),
      tap(projects => {
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Get recent projects
  getRecentProjects(limit: number = 5): Observable<Project[]> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<ProjectApiResponse>(API_ENDPOINTS.PROJECTS.RECENT, { params }).pipe(
      map(response => {
        const projects = Array.isArray(response.data) ? response.data : [response.data];
        return projects as Project[];
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Get single project by ID
  getProjectById(id: number): Observable<Project> {
    return this.http.get<ProjectApiResponse>(API_ENDPOINTS.PROJECTS.BY_ID(id)).pipe(
      map(response => response.data as Project),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Create new project
  createProject(project: CreateProjectRequest): Observable<Project> {
    return this.http.post<ProjectApiResponse>(API_ENDPOINTS.PROJECTS.BASE, project).pipe(
      map(response => response.data as Project),
      tap(newProject => {
        const currentProjects = this.projectsSubject.value;
        this.projectsSubject.next([newProject, ...currentProjects]);
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Update existing project
  updateProject(id: number, project: UpdateProjectRequest): Observable<Project> {
    return this.http.put<ProjectApiResponse>(API_ENDPOINTS.PROJECTS.BY_ID(id), project).pipe(
      map(response => response.data as Project),
      tap(updatedProject => {
        const currentProjects = this.projectsSubject.value;
        const index = currentProjects.findIndex(p => p.id === id);
        if (index !== -1) {
          currentProjects[index] = updatedProject;
          this.projectsSubject.next([...currentProjects]);
        }
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Delete project
  deleteProject(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.PROJECTS.BY_ID(id)).pipe(
      tap(() => {
        const currentProjects = this.projectsSubject.value;
        const filteredProjects = currentProjects.filter(p => p.id !== id);
        this.projectsSubject.next(filteredProjects);
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Archive project
  archiveProject(id: number): Observable<Project> {
    return this.http.patch<ProjectApiResponse>(API_ENDPOINTS.PROJECTS.ARCHIVE(id), { status: ProjectStatus.ARCHIVED }).pipe(
      map(response => response.data as Project),
      tap(archivedProject => {
        const currentProjects = this.projectsSubject.value;
        const index = currentProjects.findIndex(p => p.id === id);
        if (index !== -1) {
          currentProjects[index] = archivedProject;
          this.projectsSubject.next([...currentProjects]);
        }
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Contributor Management
  // Add contributor to project
  addContributor(projectId: number, contributorRequest: AddContributorRequest): Observable<ProjectContributor> {
    return this.http.post<ProjectContributor>(API_ENDPOINTS.PROJECTS.CONTRIBUTORS(projectId), contributorRequest).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Remove contributor from project
  removeContributor(projectId: number, username: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.PROJECTS.REMOVE_CONTRIBUTOR(projectId, username)).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Get project contributors
  getProjectContributors(projectId: number): Observable<ProjectContributor[]> {
    return this.http.get<ProjectContributor[]>(API_ENDPOINTS.PROJECTS.CONTRIBUTORS(projectId)).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Get projects by status
  getProjectsByStatus(status: ProjectStatus): Observable<Project[]> {
    return this.getProjects({ status });
  }

  // Search projects
  searchProjects(query: string, filters?: Omit<ProjectFilters, 'search'>): Observable<Project[]> {
    return this.getProjects({ ...filters, search: query });
  }

  // Get project statistics
  getProjectStats(): Observable<ProjectStats> {
    return this.http.get<ProjectStats>(API_ENDPOINTS.ANALYTICS.DASHBOARD).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Get project statistics by ID
  getProjectStatsById(projectId: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.ANALYTICS.PROJECT_STATS(projectId)).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Get user's active projects
  getUserActiveProjects(userId?: number): Observable<Project[]> {
    return this.getProjects({ 
      status: ProjectStatus.ACTIVE,
      created_by: userId,
      sort_by: 'updated_at',
      sort_order: 'desc'
    });
  }

  // Get user's completed projects
  getUserCompletedProjects(userId?: number): Observable<Project[]> {
    return this.getProjects({ 
      status: ProjectStatus.COMPLETED,
      created_by: userId,
      sort_by: 'updated_at',
      sort_order: 'desc'
    });
  }

  // Clear projects cache
  clearProjectsCache(): void {
    this.projectsSubject.next([]);
  }

  // Refresh projects
  refreshProjects(filters?: ProjectFilters): Observable<Project[]> {
    this.clearProjectsCache();
    return this.getProjects(filters);
  }
}