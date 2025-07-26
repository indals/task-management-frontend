import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  AssignTaskRequest,
  TaskComment,
  CreateCommentRequest,
  UpdateCommentRequest,
  TimeLog,
  CreateTimeLogRequest,
  UpdateTimeLogRequest,
  ApiResponse,
  PaginatedResponse
} from '../models';

export interface TaskFilters {
  status?: string;
  priority?: string;
  task_type?: string;
  assigned_to_id?: number;
  project_id?: number;
  sprint_id?: number;
  created_by_id?: number;
  created_by?: number; // Alternative field name
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public tasks$ = this.tasksSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  // FIXED: Add getAllTasks method that components are calling
  getAllTasks(filters?: TaskFilters): Observable<Task[]> {
    return this.getTasks(filters).pipe(
      map(response => response.data)
    );
  }

  // Task CRUD operations
  getTasks(filters?: TaskFilters): Observable<PaginatedResponse<Task>> {
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

    return this.http.get<PaginatedResponse<Task>>(API_ENDPOINTS.TASKS.BASE, { params })
      .pipe(
        tap(response => {
          this.tasksSubject.next(response.data);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(API_ENDPOINTS.TASKS.BY_ID(id))
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  createTask(taskData: CreateTaskRequest): Observable<Task> {
    this.loadingSubject.next(true);
    
    return this.http.post<ApiResponse<Task>>(API_ENDPOINTS.TASKS.BASE, taskData)
      .pipe(
        map(response => response.data!),
        tap(task => {
          const currentTasks = this.tasksSubject.value;
          this.tasksSubject.next([task, ...currentTasks]);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  updateTask(id: number, taskData: UpdateTaskRequest): Observable<Task> {
    this.loadingSubject.next(true);
    
    return this.http.put<ApiResponse<Task>>(API_ENDPOINTS.TASKS.BY_ID(id), taskData)
      .pipe(
        map(response => response.data!),
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          const index = currentTasks.findIndex(task => task.id === id);
          if (index !== -1) {
            currentTasks[index] = updatedTask;
            this.tasksSubject.next([...currentTasks]);
          }
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  deleteTask(id: number): Observable<ApiResponse> {
    this.loadingSubject.next(true);
    
    return this.http.delete<ApiResponse>(API_ENDPOINTS.TASKS.BY_ID(id))
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const filteredTasks = currentTasks.filter(task => task.id !== id);
          this.tasksSubject.next(filteredTasks);
          this.loadingSubject.next(false);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  assignTask(id: number, assignData: AssignTaskRequest): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(API_ENDPOINTS.TASKS.ASSIGN(id), assignData)
      .pipe(
        map(response => response.data!),
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          const index = currentTasks.findIndex(task => task.id === id);
          if (index !== -1) {
            currentTasks[index] = updatedTask;
            this.tasksSubject.next([...currentTasks]);
          }
        }),
        catchError(this.handleError.bind(this))
      );
  }

  getOverdueTasks(): Observable<Task[]> {
    return this.http.get<ApiResponse<Task[]>>(API_ENDPOINTS.TASKS.OVERDUE)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  // Task Comments - FIXED: Add proper comment methods
  getTaskComments(taskId: number): Observable<TaskComment[]> {
    return this.http.get<ApiResponse<TaskComment[]>>(API_ENDPOINTS.TASKS.COMMENTS(taskId))
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  createTaskComment(taskId: number, commentData: CreateCommentRequest): Observable<TaskComment> {
    return this.http.post<ApiResponse<TaskComment>>(API_ENDPOINTS.TASKS.COMMENTS(taskId), commentData)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  // FIXED: Add addComment method that components are calling
  addComment(taskId: number, commentData: { text: string }): Observable<TaskComment> {
    const createCommentRequest: CreateCommentRequest = {
      content: commentData.text
    };
    return this.createTaskComment(taskId, createCommentRequest);
  }

  updateTaskComment(commentId: number, commentData: UpdateCommentRequest): Observable<TaskComment> {
    return this.http.put<ApiResponse<TaskComment>>(API_ENDPOINTS.TASKS.COMMENT_BY_ID(commentId), commentData)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  deleteTaskComment(commentId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(API_ENDPOINTS.TASKS.COMMENT_BY_ID(commentId))
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // Time Logs
  getTaskTimeLogs(taskId: number): Observable<TimeLog[]> {
    return this.http.get<ApiResponse<TimeLog[]>>(API_ENDPOINTS.TASKS.TIME_LOG(taskId))
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  createTimeLog(taskId: number, timeLogData: CreateTimeLogRequest): Observable<TimeLog> {
    return this.http.post<ApiResponse<TimeLog>>(API_ENDPOINTS.TASKS.TIME_LOG(taskId), timeLogData)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  updateTimeLog(taskId: number, timeLogId: number, timeLogData: UpdateTimeLogRequest): Observable<TimeLog> {
    return this.http.put<ApiResponse<TimeLog>>(`${API_ENDPOINTS.TASKS.TIME_LOG(taskId)}/${timeLogId}`, timeLogData)
      .pipe(
        map(response => response.data!),
        catchError(this.handleError.bind(this))
      );
  }

  deleteTimeLog(taskId: number, timeLogId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${API_ENDPOINTS.TASKS.TIME_LOG(taskId)}/${timeLogId}`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  // Utility methods
  getMyTasks(): Observable<Task[]> {
    return this.getTasks({ assigned_to_id: this.getCurrentUserId() })
      .pipe(
        map(response => response.data)
      );
  }

  getTasksByStatus(status: string): Observable<Task[]> {
    return this.getTasks({ status })
      .pipe(
        map(response => response.data)
      );
  }

  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.getTasks({ project_id: projectId })
      .pipe(
        map(response => response.data)
      );
  }

  getTasksBySprint(sprintId: number): Observable<Task[]> {
    return this.getTasks({ sprint_id: sprintId })
      .pipe(
        map(response => response.data)
      );
  }

  searchTasks(query: string): Observable<Task[]> {
    return this.getTasks({ search: query })
      .pipe(
        map(response => response.data)
      );
  }

  private getCurrentUserId(): number {
    // Get from auth service or local storage
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
    
    console.error('Task Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}