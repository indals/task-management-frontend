// src/app/core/services/sprint.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';
import { 
  Sprint, 
  CreateSprintRequest, 
  UpdateSprintRequest, 
  SprintFilters,
  SprintBurndownData,
  SprintStats,
  SprintResponse,
  SprintListResponse,
  SprintBurndownResponse,
  SprintStatsResponse,
  calculateSprintVelocity,
  VelocityMetrics
} from '../models/sprint.model';
import { Task } from '../models/task.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class SprintService {
  private sprintsSubject = new BehaviorSubject<Sprint[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private selectedSprintSubject = new BehaviorSubject<Sprint | null>(null);
  private activeSprintSubject = new BehaviorSubject<Sprint | null>(null);

  public sprints$ = this.sprintsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public selectedSprint$ = this.selectedSprintSubject.asObservable();
  public activeSprint$ = this.activeSprintSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Sprint CRUD Operations
  getAllSprints(filters?: SprintFilters): Observable<PaginatedResponse<Sprint>> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v.toString()));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<SprintListResponse>(API_ENDPOINTS.SPRINTS.BASE, { params })
      .pipe(
        tap(response => {
          this.sprintsSubject.next(response.data);
          this.updateActiveSprint(response.data);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.errorHandler.handleError(error);
        })
      );
  }

  getSprintById(id: number, includeTasks: boolean = false): Observable<Sprint> {
    let params = new HttpParams();
    if (includeTasks) {
      params = params.set('include_tasks', 'true');
    }

    return this.http.get<SprintResponse>(API_ENDPOINTS.SPRINTS.BY_ID(id), { params })
      .pipe(
        map(response => response.data),
        tap(sprint => this.selectedSprintSubject.next(sprint)),
        catchError(this.errorHandler.handleError)
      );
  }

  createSprint(sprintData: CreateSprintRequest): Observable<Sprint> {
    this.loadingSubject.next(true);
    
    return this.http.post<SprintResponse>(API_ENDPOINTS.SPRINTS.BASE, sprintData)
      .pipe(
        map(response => response.data),
        tap(newSprint => {
          const currentSprints = this.sprintsSubject.value;
          this.sprintsSubject.next([newSprint, ...currentSprints]);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.errorHandler.handleError(error);
        })
      );
  }

  updateSprint(id: number, updates: UpdateSprintRequest): Observable<Sprint> {
    return this.http.put<SprintResponse>(API_ENDPOINTS.SPRINTS.BY_ID(id), updates)
      .pipe(
        map(response => response.data),
        tap(updatedSprint => {
          this.updateSprintInState(updatedSprint);
          this.selectedSprintSubject.next(updatedSprint);
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  deleteSprint(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(API_ENDPOINTS.SPRINTS.BY_ID(id))
      .pipe(
        map(() => void 0),
        tap(() => {
          const currentSprints = this.sprintsSubject.value;
          const filteredSprints = currentSprints.filter(sprint => sprint.id !== id);
          this.sprintsSubject.next(filteredSprints);
          
          if (this.selectedSprintSubject.value?.id === id) {
            this.selectedSprintSubject.next(null);
          }
          
          if (this.activeSprintSubject.value?.id === id) {
            this.activeSprintSubject.next(null);
          }
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  // Sprint Lifecycle Management
  startSprint(sprintId: number): Observable<Sprint> {
    return this.http.post<SprintResponse>(API_ENDPOINTS.SPRINTS.START(sprintId), {})
      .pipe(
        map(response => response.data),
        tap(updatedSprint => {
          this.updateSprintInState(updatedSprint);
          this.activeSprintSubject.next(updatedSprint);
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  completeSprint(sprintId: number): Observable<Sprint> {
    return this.http.post<SprintResponse>(API_ENDPOINTS.SPRINTS.COMPLETE(sprintId), {})
      .pipe(
        map(response => response.data),
        tap(completedSprint => {
          this.updateSprintInState(completedSprint);
          
          if (this.activeSprintSubject.value?.id === sprintId) {
            this.activeSprintSubject.next(null);
          }
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  // Project-specific Sprint Operations
  getProjectSprints(projectId: number): Observable<PaginatedResponse<Sprint>> {
    return this.http.get<SprintListResponse>(API_ENDPOINTS.SPRINTS.PROJECT_SPRINTS(projectId))
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  // Sprint Analytics & Reporting
  getSprintBurndown(sprintId: number): Observable<SprintBurndownData> {
    return this.http.get<SprintBurndownResponse>(API_ENDPOINTS.SPRINTS.BURNDOWN(sprintId))
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  getSprintStats(projectId?: number): Observable<SprintStats> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('project_id', projectId.toString());
    }

    return this.http.get<SprintStatsResponse>(`${API_ENDPOINTS.SPRINTS.BASE}/stats`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Task Management within Sprints
  addTaskToSprint(sprintId: number, taskId: number): Observable<void> {
    return this.http.post<ApiResponse<null>>(API_ENDPOINTS.SPRINTS.ADD_TASK(sprintId, taskId), {})
      .pipe(
        map(() => void 0),
        tap(() => {
          // Refresh the sprint to get updated task count
          this.refreshSprintById(sprintId);
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  removeTaskFromSprint(sprintId: number, taskId: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(API_ENDPOINTS.SPRINTS.REMOVE_TASK(sprintId, taskId))
      .pipe(
        map(() => void 0),
        tap(() => {
          // Refresh the sprint to get updated task count
          this.refreshSprintById(sprintId);
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  bulkAddTasksToSprint(sprintId: number, taskIds: number[]): Observable<void> {
    const requests = taskIds.map(taskId => 
      this.addTaskToSprint(sprintId, taskId)
    );
    
    return new Observable(observer => {
      Promise.all(requests.map(req => req.toPromise()))
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => observer.error(error));
    });
  }

  // Sprint Queries & Filters
  getActiveSprints(projectId?: number): Observable<Sprint[]> {
    const filters: SprintFilters = {
      status: ['ACTIVE'],
      project_id: projectId ? [projectId] : undefined
    };
    
    return this.getAllSprints(filters).pipe(
      map(response => response.data)
    );
  }

  getPlannedSprints(projectId?: number): Observable<Sprint[]> {
    const filters: SprintFilters = {
      status: ['PLANNED'],
      project_id: projectId ? [projectId] : undefined
    };
    
    return this.getAllSprints(filters).pipe(
      map(response => response.data)
    );
  }

  getCompletedSprints(projectId?: number): Observable<Sprint[]> {
    const filters: SprintFilters = {
      status: ['COMPLETED'],
      project_id: projectId ? [projectId] : undefined
    };
    
    return this.getAllSprints(filters).pipe(
      map(response => response.data)
    );
  }

  getCurrentActiveSprint(): Sprint | null {
    return this.activeSprintSubject.value;
  }

  // Sprint Velocity & Performance Calculations
  calculateSprintVelocity(sprint: Sprint): VelocityMetrics {
    return calculateSprintVelocity(sprint);
  }

  getSprintVelocityTrend(projectId: number, sprintCount: number = 5): Observable<Array<{
    sprint: Sprint;
    velocity: VelocityMetrics;
  }>> {
    const filters: SprintFilters = {
      project_id: [projectId],
      status: ['COMPLETED'],
      sort_by: 'start_date',
      sort_order: 'desc',
      page_size: sprintCount
    };

    return this.getAllSprints(filters).pipe(
      map(response => 
        response.data.map(sprint => ({
          sprint,
          velocity: this.calculateSprintVelocity(sprint)
        }))
      )
    );
  }

  // Sprint Planning Helpers
  getRecommendedSprintCapacity(teamSize: number, sprintDurationDays: number): number {
    // Assuming 6 hours per day per team member for sprint work
    const hoursPerDay = 6;
    return teamSize * sprintDurationDays * hoursPerDay;
  }

  getRecommendedVelocityPoints(previousSprints: Sprint[]): number {
    if (previousSprints.length === 0) return 20; // Default starting velocity
    
    const completedSprints = previousSprints.filter(s => s.status === 'COMPLETED');
    if (completedSprints.length === 0) return 20;
    
    const totalVelocity = completedSprints.reduce((sum, sprint) => {
      const velocity = this.calculateSprintVelocity(sprint);
      return sum + velocity.completed_points;
    }, 0);
    
    return Math.round(totalVelocity / completedSprints.length);
  }

  // Utility Methods
  private updateSprintInState(updatedSprint: Sprint): void {
    const currentSprints = this.sprintsSubject.value;
    const index = currentSprints.findIndex(sprint => sprint.id === updatedSprint.id);
    
    if (index !== -1) {
      currentSprints[index] = updatedSprint;
      this.sprintsSubject.next([...currentSprints]);
    }
    
    if (updatedSprint.status === 'ACTIVE') {
      this.activeSprintSubject.next(updatedSprint);
    }
  }

  private updateActiveSprint(sprints: Sprint[]): void {
    const activeSprint = sprints.find(sprint => sprint.status === 'ACTIVE');
    this.activeSprintSubject.next(activeSprint || null);
  }

  private refreshSprintById(sprintId: number): void {
    this.getSprintById(sprintId, true).subscribe();
  }

  // State Management
  setSelectedSprint(sprint: Sprint | null): void {
    this.selectedSprintSubject.next(sprint);
  }

  clearSprints(): void {
    this.sprintsSubject.next([]);
    this.selectedSprintSubject.next(null);
    this.activeSprintSubject.next(null);
  }

  refreshSprints(filters?: SprintFilters): Observable<PaginatedResponse<Sprint>> {
    return this.getAllSprints(filters);
  }
}