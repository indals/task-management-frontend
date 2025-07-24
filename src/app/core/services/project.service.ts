// src/app/core/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';

// Updated interfaces to match API
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  owner_id: number;
  status: 'active' | 'completed' | 'archived';
  owner: User;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'completed' | 'archived';
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  // private apiUrl = `${environment.apiUrl}/api/projects`;
  private apiUrl = 'http://127.0.0.1:5000/api/projects';

  constructor(private http: HttpClient) { }

  // Get all projects
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  // Get single project by ID
  getProject(id: string | number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  // Get recent projects
  getRecentProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/recent`);
  }

  // Create new project
  createProject(project: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  // Update existing project
  updateProject(id: string | number, changes: UpdateProjectRequest): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${id}`, changes);
  }

  // Delete project
  deleteProject(id: string | number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}