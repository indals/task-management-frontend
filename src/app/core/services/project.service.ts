// src/app/core/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { ErrorHandlerService } from './error-handler.service';
import { API_ENDPOINTS } from '../constants/api.constants';

export interface CreateProjectRequest {
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(API_ENDPOINTS.PROJECTS.BASE)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  getRecentProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${API_ENDPOINTS.PROJECTS.BASE}/recent`)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(API_ENDPOINTS.PROJECTS.BY_ID(id))
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  createProject(project: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(API_ENDPOINTS.PROJECTS.BASE, project)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  updateProject(id: number, project: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(API_ENDPOINTS.PROJECTS.BY_ID(id), project)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.PROJECTS.BY_ID(id))
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }
}