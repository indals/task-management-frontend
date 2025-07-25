// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';
import { AuthService } from './auth.service';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilters, 
  BulkTaskUpdate,
  TaskStats,
  TaskComment,
  CreateCommentRequest,
  UpdateCommentRequest,
  TaskTimeLog,
  CreateTimeLogRequest,
  TaskAssignmentRequest,
  TaskStatusUpdateRequest,
  TaskResponse,
  TaskListResponse,
  TaskStatsResponse,
  TaskCommentsResponse,
  TaskTimeLogsResponse,
  TaskActivitiesResponse
} from '../models/task.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private selectedTaskSubject = new BehaviorSubject<Task | null>(null);

  public tasks$ = this.tasksSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public selectedTask$ = this.selectedTaskSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) {}

  // Task CRUD Operations
  getAllTasks(filters?: TaskFilters): Observable<PaginatedResponse<Task>> {
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

    return this.http.get<PaginatedResponse<Task>>(API_ENDPOINTS.TASKS.BASE, { params })
      .pipe(
        tap(response => {
          this.tasksSubject.next(response.data);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.errorHandler.handleError(error);
        })
      );
  }

  getTaskById(id: number, includeDetails: boolean = true): Observable<Task> {
    let params = new HttpParams();
    if (includeDetails) {
      params = params.set('include_details', 'true');
    }

    return this.http.get<TaskResponse>(API_ENDPOINTS.TASKS.BY_ID(id), { params })
      .pipe(
        map(response => response.data),
        tap(task => this.selectedTaskSubject.next(task)),
        catchError(this.errorHandler.handleError)
      );
  }

  createTask(taskData: CreateTaskRequest): Observable<Task> {
    this.loadingSubject.next(true);
    
    return this.http.post<TaskResponse>(API_ENDPOINTS.TASKS.BASE, taskData)
      .pipe(
        map(response => response.data),
        tap(newTask => {
          const currentTasks = this.tasksSubject.value;
          this.tasksSubject.next([newTask, ...currentTasks]);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.errorHandler.handleError(error);
        })
      );
  }

  updateTask(id: number, updates: UpdateTaskRequest): Observable<Task> {
    return this.http.put<TaskResponse>(API_ENDPOINTS.TASKS.BY_ID(id), updates)
      .pipe(
        map(response => response.data),
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          const index = currentTasks.findIndex(task => task.id === id);
          if (index !== -1) {
            currentTasks[index] = updatedTask;
            this.tasksSubject.next([...currentTasks]);
          }
          this.selectedTaskSubject.next(updatedTask);
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(API_ENDPOINTS.TASKS.BY_ID(id))
      .pipe(
        map(() => void 0),
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const filteredTasks = currentTasks.filter(task => task.id !== id);
          this.tasksSubject.next(filteredTasks);
          
          if (this.selectedTaskSubject.value?.id === id) {
            this.selectedTaskSubject.next(null);
          }
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  // Task Assignment & Status Management
  assignTask(taskId: number, assigneeId: number): Observable<Task> {
    const request: TaskAssignmentRequest = { assignee_id: assigneeId };
    
    return this.http.post<TaskResponse>(API_ENDPOINTS.TASKS.ASSIGN(taskId), request)
      .pipe(
        map(response => response.data),
        tap(updatedTask => this.updateTaskInState(updatedTask)),
        catchError(this.errorHandler.handleError)
      );
  }

  unassignTask(taskId: number): Observable<Task> {
    return this.http.delete<TaskResponse>(API_ENDPOINTS.TASKS.UNASSIGN(taskId))
      .pipe(
        map(response => response.data),
        tap(updatedTask => this.updateTaskInState(updatedTask)),
        catchError(this.errorHandler.handleError)
      );
  }

  updateTaskStatus(taskId: number, status: string, comment?: string): Observable<Task> {
    const request: TaskStatusUpdateRequest = { status: status as any, comment };
    
    return this.http.put<TaskResponse>(API_ENDPOINTS.TASKS.STATUS(taskId), request)
      .pipe(
        map(response => response.data),
        tap(updatedTask => this.updateTaskInState(updatedTask)),
        catchError(this.errorHandler.handleError)
      );
  }

  // Bulk Operations
  bulkUpdateTasks(updates: BulkTaskUpdate): Observable<Task[]> {
    this.loadingSubject.next(true);
    
    return this.http.put<ApiResponse<Task[]>>(API_ENDPOINTS.TASKS.BULK_UPDATE, updates)
      .pipe(
        map(response => response.data),
        tap(updatedTasks => {
          updatedTasks.forEach(task => this.updateTaskInState(task));
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.errorHandler.handleError(error);
        })
      );
  }

  bulkDeleteTasks(taskIds: number[]): Observable<void> {
    return this.http.delete<ApiResponse<null>>(API_ENDPOINTS.TASKS.BULK_DELETE, {
      body: { task_ids: taskIds }
    })
      .pipe(
        map(() => void 0),
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const filteredTasks = currentTasks.filter(task => !taskIds.includes(task.id));
          this.tasksSubject.next(filteredTasks);
        }),
        catchError(this.errorHandler.handleError)
      );
  }

  // Search & Filtering
  searchTasks(query: string, filters?: Partial<TaskFilters>): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams().set('q', query);
    
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

    return this.http.get<PaginatedResponse<Task>>(API_ENDPOINTS.TASKS.SEARCH, { params })
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  // Task Comments
  getTaskComments(taskId: number, page: number = 1, pageSize: number = 20): Observable<PaginatedResponse<TaskComment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<TaskCommentsResponse>(API_ENDPOINTS.TASKS.COMMENTS(taskId), { params })
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  addComment(taskId: number, content: string): Observable<TaskComment> {
    const request: CreateCommentRequest = { content };
    
    return this.http.post<ApiResponse<TaskComment>>(API_ENDPOINTS.TASKS.COMMENTS(taskId), request)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  updateComment(taskId: number, commentId: number, content: string): Observable<TaskComment> {
    const request: UpdateCommentRequest = { content };
    
    return this.http.put<ApiResponse<TaskComment>>(
      API_ENDPOINTS.TASKS.COMMENT_BY_ID(taskId, commentId), 
      request
    )
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  deleteComment(taskId: number, commentId: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(API_ENDPOINTS.TASKS.COMMENT_BY_ID(taskId, commentId))
      .pipe(
        map(() => void 0),
        catchError(this.errorHandler.handleError)
      );
  }

  // Time Tracking
  getTaskTimeLogs(taskId: number): Observable<TaskTimeLogsResponse['data']> {
    return this.http.get<TaskTimeLogsResponse>(API_ENDPOINTS.TASKS.TIME_LOGS(taskId))
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  logTime(taskId: number, timeLog: CreateTimeLogRequest): Observable<TaskTimeLog> {
    return this.http.post<ApiResponse<TaskTimeLog>>(API_ENDPOINTS.TASKS.TIME_LOGS(taskId), timeLog)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Task Statistics & Analytics
  getTaskStats(filters?: Partial<TaskFilters>): Observable<TaskStats> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<TaskStatsResponse>(API_ENDPOINTS.TASKS.STATS, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Specialized Task Queries
  getMyTasks(filters?: Partial<TaskFilters>): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Task>>(API_ENDPOINTS.TASKS.MY_TASKS, { params })
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  getOverdueTasks(): Observable<PaginatedResponse<Task>> {
    return this.http.get<PaginatedResponse<Task>>(API_ENDPOINTS.TASKS.OVERDUE)
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  getTasksByStatus(status: string, filters?: Partial<TaskFilters>): Observable<PaginatedResponse<Task>> {
    const taskFilters: TaskFilters = {
      ...filters,
      status: [status as any]
    };
    return this.getAllTasks(taskFilters);
  }

  getTasksByPriority(priority: string, filters?: Partial<TaskFilters>): Observable<PaginatedResponse<Task>> {
    const taskFilters: TaskFilters = {
      ...filters,
      priority: [priority as any]
    };
    return this.getAllTasks(taskFilters);
  }

  // Export & Reporting
  exportTasks(format: 'csv' | 'xlsx' | 'pdf', filters?: TaskFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
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

    return this.http.get(API_ENDPOINTS.TASKS.EXPORT, {
      params,
      responseType: 'blob'
    })
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  // Utility Methods
  private updateTaskInState(updatedTask: Task): void {
    const currentTasks = this.tasksSubject.value;
    const index = currentTasks.findIndex(task => task.id === updatedTask.id);
    
    if (index !== -1) {
      currentTasks[index] = updatedTask;
      this.tasksSubject.next([...currentTasks]);
    }
    
    if (this.selectedTaskSubject.value?.id === updatedTask.id) {
      this.selectedTaskSubject.next(updatedTask);
    }
  }

  getCurrentUserId(): number {
    const user = this.authService.getCurrentUser();
    return user?.id || 0;
  }

  // State Management
  setSelectedTask(task: Task | null): void {
    this.selectedTaskSubject.next(task);
  }

  clearTasks(): void {
    this.tasksSubject.next([]);
    this.selectedTaskSubject.next(null);
  }

  refreshTasks(filters?: TaskFilters): Observable<PaginatedResponse<Task>> {
    return this.getAllTasks(filters);
  }
}