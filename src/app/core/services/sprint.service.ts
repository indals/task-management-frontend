import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { 
  Sprint, 
  CreateSprintRequest, 
  UpdateSprintRequest,
  SprintBurndown,
  SprintTask,
  Task,
  ApiResponse,
  PaginatedResponse
} from '../models';

export interface SprintFilters {
  status?: string;
  project_id?: number;
  created_by_id?: number;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private sprintsSubject = new BehaviorSubject<Sprint[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public sprints$ = this.sprintsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  // 🔧 IMPROVED: Handle new response format for sprints list
  getSprints(filters?: SprintFilters): Observable<PaginatedResponse<Sprint>> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Sprint>>>(API_ENDPOINTS.SPRINTS.BASE, { params })
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load sprints');
          }
        }),
        tap(paginatedResponse => {
          this.sprintsSubject.next(paginatedResponse.data);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 IMPROVED: Handle new response format
  getSprintById(id: number): Observable<Sprint> {
    return this.http.get<ApiResponse<Sprint>>(API_ENDPOINTS.SPRINTS.BY_ID(id))
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load sprint');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 IMPROVED: Handle new response format for create
  createSprint(sprintData: CreateSprintRequest): Observable<Sprint> {
    this.loadingSubject.next(true);
    
    return this.http.post<ApiResponse<Sprint>>(API_ENDPOINTS.SPRINTS.BASE, sprintData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to create sprint');
          }
        }),
        tap(sprint => {
          const currentSprints = this.sprintsSubject.value;
          this.sprintsSubject.next([sprint, ...currentSprints]);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 IMPROVED: Handle new response format for update
  updateSprint(id: number, sprintData: UpdateSprintRequest): Observable<Sprint> {
    this.loadingSubject.next(true);
    
    return this.http.put<ApiResponse<Sprint>>(API_ENDPOINTS.SPRINTS.BY_ID(id), sprintData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to update sprint');
          }
        }),
        tap(updatedSprint => {
          const currentSprints = this.sprintsSubject.value;
          const index = currentSprints.findIndex(sprint => sprint.id === id);
          if (index !== -1) {
            currentSprints[index] = updatedSprint;
            this.sprintsSubject.next([...currentSprints]);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 IMPROVED: Handle new response format for delete
  deleteSprint(id: number): Observable<ApiResponse> {
    this.loadingSubject.next(true);
    
    return this.http.delete<ApiResponse>(API_ENDPOINTS.SPRINTS.BY_ID(id))
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to delete sprint');
          }
          return response;
        }),
        tap(() => {
          const currentSprints = this.sprintsSubject.value;
          const filteredSprints = currentSprints.filter(sprint => sprint.id !== id);
          this.sprintsSubject.next(filteredSprints);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 IMPROVED: Handle new response format for project sprints
  getSprintsByProject(projectId: number): Observable<Sprint[]> {
    return this.http.get<ApiResponse<Sprint[]>>(API_ENDPOINTS.SPRINTS.PROJECT(projectId))
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load project sprints');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 IMPROVED: Handle new response format for start sprint
  startSprint(id: number): Observable<Sprint> {
    return this.http.post<ApiResponse<Sprint>>(API_ENDPOINTS.SPRINTS.START(id), {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to start sprint');
          }
        }),
        tap(updatedSprint => {
          const currentSprints = this.sprintsSubject.value;
          const index = currentSprints.findIndex(sprint => sprint.id === id);
          if (index !== -1) {
            currentSprints[index] = updatedSprint;
            this.sprintsSubject.next([...currentSprints]);
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 IMPROVED: Handle new response format for complete sprint
  completeSprint(id: number): Observable<Sprint> {
    return this.http.post<ApiResponse<Sprint>>(API_ENDPOINTS.SPRINTS.COMPLETE(id), {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to complete sprint');
          }
        }),
        tap(updatedSprint => {
          const currentSprints = this.sprintsSubject.value;
          const index = currentSprints.findIndex(sprint => sprint.id === id);
          if (index !== -1) {
            currentSprints[index] = updatedSprint;
            this.sprintsSubject.next([...currentSprints]);
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 IMPROVED: Handle new response format for burndown
  getSprintBurndown(id: number): Observable<SprintBurndown> {
    return this.http.get<ApiResponse<SprintBurndown>>(API_ENDPOINTS.SPRINTS.BURNDOWN(id))
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load sprint burndown');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // 🔧 IMPROVED: Sprint Tasks Management with new response format
  getSprintTasks(sprintId: number): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${API_ENDPOINTS.SPRINTS.BY_ID(sprintId)}/tasks`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load sprint tasks');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  addTaskToSprint(sprintId: number, taskId: number): Observable<SprintTask> {
    return this.http.post<ApiResponse<SprintTask>>(API_ENDPOINTS.SPRINTS.ADD_TASK(sprintId, taskId), {})
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to add task to sprint');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  removeTaskFromSprint(sprintId: number, taskId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(API_ENDPOINTS.SPRINTS.REMOVE_TASK(sprintId, taskId))
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || 'Failed to remove task from sprint');
          }
          return response;
        }),
        catchError(this.handleError.bind(this))
      );
  }

  // Utility methods
  getActiveSprints(): Observable<Sprint[]> {
    return this.getSprints({ status: 'ACTIVE' })
      .pipe(
        map(response => response.data)
      );
  }

  getSprintsByStatus(status: string): Observable<Sprint[]> {
    return this.getSprints({ status })
      .pipe(
        map(response => response.data)
      );
  }

  getMySprints(): Observable<Sprint[]> {
    const userId = this.getCurrentUserId();
    return this.getSprints({ created_by_id: userId })
      .pipe(
        map(response => response.data)
      );
  }

  searchSprints(query: string): Observable<Sprint[]> {
    return this.getSprints({ search: query })
      .pipe(
        map(response => response.data)
      );
  }

  // 🔧 IMPROVED: Sprint analytics with new response format
  getSprintProgress(sprintId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${API_ENDPOINTS.SPRINTS.BY_ID(sprintId)}/progress`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load sprint progress');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getSprintVelocity(sprintId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${API_ENDPOINTS.SPRINTS.BY_ID(sprintId)}/velocity`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load sprint velocity');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getSprintCapacity(sprintId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${API_ENDPOINTS.SPRINTS.BY_ID(sprintId)}/capacity`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to load sprint capacity');
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  private getCurrentUserId(): number {
    const userStr = localStorage.getItem('user-info');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  // 🔧 IMPROVED: Better error handling for new response format
  private handleError(error: HttpErrorResponse): Observable<never> {
    this.loadingSubject.next(false);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error - handle new response format
      if (error.error?.success === false) {
        // New standardized error format
        errorMessage = error.error.message || `Error ${error.status}`;
      } else if (error.error?.message) {
        // Legacy error format
        errorMessage = error.error.message;
      } else if (error.error?.errors && error.error.errors.length > 0) {
        errorMessage = error.error.errors[0];
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Sprint Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}