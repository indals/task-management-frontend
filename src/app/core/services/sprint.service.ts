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

  // Sprint CRUD operations
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

    return this.http.get<PaginatedResponse<Sprint>>(API_ENDPOINTS.SPRINTS.BASE, { params })
      .pipe(
        tap(response => {
          this.sprintsSubject.next(response.data);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getSprintById(id: number): Observable<Sprint> {
    return this.http.get<ApiResponse<Sprint>>(API_ENDPOINTS.SPRINTS.BY_ID(id))
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  createSprint(sprintData: CreateSprintRequest): Observable<Sprint> {
    this.loadingSubject.next(true);
    
    return this.http.post<ApiResponse<Sprint>>(API_ENDPOINTS.SPRINTS.BASE, sprintData)
      .pipe(
        map(response => response.data!),
        tap(sprint => {
          const currentSprints = this.sprintsSubject.value;
          this.sprintsSubject.next([sprint, ...currentSprints]);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  updateSprint(id: number, sprintData: UpdateSprintRequest): Observable<Sprint> {
    this.loadingSubject.next(true);
    
    return this.http.put<ApiResponse<Sprint>>(API_ENDPOINTS.SPRINTS.BY_ID(id), sprintData)
      .pipe(
        map(response => response.data!),
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

  deleteSprint(id: number): Observable<ApiResponse> {
    this.loadingSubject.next(true);
    
    return this.http.delete<ApiResponse>(API_ENDPOINTS.SPRINTS.BY_ID(id))
      .pipe(
        tap(() => {
          const currentSprints = this.sprintsSubject.value;
          const filteredSprints = currentSprints.filter(sprint => sprint.id !== id);
          this.sprintsSubject.next(filteredSprints);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getSprintsByProject(projectId: number): Observable<Sprint[]> {
    return this.http.get<ApiResponse<Sprint[]>>(API_ENDPOINTS.SPRINTS.PROJECT(projectId))
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  startSprint(id: number): Observable<Sprint> {
    return this.http.post<ApiResponse<Sprint>>(API_ENDPOINTS.SPRINTS.START(id), {})
      .pipe(
        map(response => response.data!),
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

  completeSprint(id: number): Observable<Sprint> {
    return this.http.post<ApiResponse<Sprint>>(API_ENDPOINTS.SPRINTS.COMPLETE(id), {})
      .pipe(
        map(response => response.data!),
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

  getSprintBurndown(id: number): Observable<SprintBurndown> {
    return this.http.get<ApiResponse<SprintBurndown>>(API_ENDPOINTS.SPRINTS.BURNDOWN(id))
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  // Sprint Tasks Management
  getSprintTasks(sprintId: number): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(`${API_ENDPOINTS.SPRINTS.BY_ID(sprintId)}/tasks`)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  addTaskToSprint(sprintId: number, taskId: number): Observable<SprintTask> {
    return this.http.post<ApiResponse<SprintTask>>(API_ENDPOINTS.SPRINTS.ADD_TASK(sprintId, taskId), {})
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  removeTaskFromSprint(sprintId: number, taskId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(API_ENDPOINTS.SPRINTS.REMOVE_TASK(sprintId, taskId))
      .pipe(
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

  getSprintProgress(sprintId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${API_ENDPOINTS.SPRINTS.BY_ID(sprintId)}/progress`)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  getSprintVelocity(sprintId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${API_ENDPOINTS.SPRINTS.BY_ID(sprintId)}/velocity`)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  getSprintCapacity(sprintId: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${API_ENDPOINTS.SPRINTS.BY_ID(sprintId)}/capacity`)
      .pipe(
        map(response => response.data!),
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.loadingSubject.next(false);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error?.message) {
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