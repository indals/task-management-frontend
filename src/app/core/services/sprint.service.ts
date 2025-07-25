import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import { environment } from '../../../environments/environment';

export interface Sprint {
  id: number;
  name: string;
  description: string;
  project_id: number;
  start_date: string;
  end_date: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  goals: string[];
  tasks: number[];
  created_at: string;
  updated_at: string;
}

export interface CreateSprintRequest {
  name: string;
  description: string;
  project_id: number;
  start_date: string;
  end_date: string;
  goals?: string[];
}

export interface UpdateSprintRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  goals?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private apiUrl = `${environment.apiUrl}/sprints`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Get all sprints for a project
  getProjectSprints(projectId: number): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(`${this.apiUrl}?project_id=${projectId}`)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Get active sprint for a project
  getActiveSprint(projectId: number): Observable<Sprint | null> {
    return this.http.get<Sprint>(`${this.apiUrl}/active?project_id=${projectId}`)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Get sprint by ID
  getSprintById(id: number): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Create new sprint
  createSprint(sprint: CreateSprintRequest): Observable<Sprint> {
    return this.http.post<Sprint>(this.apiUrl, sprint)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Update sprint
  updateSprint(id: number, sprint: UpdateSprintRequest): Observable<Sprint> {
    return this.http.put<Sprint>(`${this.apiUrl}/${id}`, sprint)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Delete sprint
  deleteSprint(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Start sprint
  startSprint(id: number): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.apiUrl}/${id}/start`, {})
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Complete sprint
  completeSprint(id: number): Observable<Sprint> {
    return this.http.post<Sprint>(`${this.apiUrl}/${id}/complete`, {})
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Add task to sprint
  addTaskToSprint(sprintId: number, taskId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${sprintId}/tasks`, { task_id: taskId })
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Remove task from sprint
  removeTaskFromSprint(sprintId: number, taskId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${sprintId}/tasks/${taskId}`)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }
}