// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Import from your models directory instead of defining here
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';

// Keep only the API-specific interfaces here
export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date: string;
  assigneeId: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string;
}

export interface TaskFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignee?: number;
  created_by?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TaskStatistics {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  overdue: number;
}

// API response interface (what actually comes from the backend)
interface TaskApiResponse {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigned_to: User;
  created_by: User;
  due_date: string;
  created_at: string;
  updated_at: string;
  comments_count: number;
  comments?: Comment[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // Helper method to map API response to Task model
  private mapApiResponseToTask(apiTask: TaskApiResponse): Task {
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      status: apiTask.status,
      priority: apiTask.priority,
      assigned_to: apiTask.assigned_to,
      assignee: apiTask.assigned_to, // camelCase alias
      created_by: apiTask.created_by,
      due_date: apiTask.due_date,
      dueDate: apiTask.due_date, // camelCase alias
      created_at: apiTask.created_at,
      createdAt: apiTask.created_at, // camelCase alias
      updated_at: apiTask.updated_at,
      updatedAt: apiTask.updated_at, // camelCase alias
      subtasks: [], // Initialize with empty array since API doesn't provide this
      comments: apiTask.comments || []
    };
  }

  // Get all tasks with optional filters
  getAllTasks(filters?: TaskFilters): Observable<Task[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.assignee) params = params.set('assignee', filters.assignee.toString());
      if (filters.created_by) params = params.set('created_by', filters.created_by.toString());
      if (filters.priority) params = params.set('priority', filters.priority);
    }

    return this.http.get<TaskApiResponse[]>(API_ENDPOINTS.TASKS.BASE, { params }).pipe(
      map(tasks => tasks.map(task => this.mapApiResponseToTask(task))),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Get single task by ID (includes comments)
  getTaskById(id: number): Observable<Task> {
    return this.http.get<TaskApiResponse>(API_ENDPOINTS.TASKS.BY_ID(id)).pipe(
      map(task => this.mapApiResponseToTask(task)),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Create new task
  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<TaskApiResponse>(API_ENDPOINTS.TASKS.BASE, task).pipe(
      map(task => this.mapApiResponseToTask(task)),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Update existing task
  updateTask(id: number, task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<TaskApiResponse>(API_ENDPOINTS.TASKS.BY_ID(id), task).pipe(
      map(task => this.mapApiResponseToTask(task)),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Delete task
  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.TASKS.BY_ID(id)).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Assign task to user
  assignTask(taskId: number, userId: number): Observable<Task> {
    return this.http.post<TaskApiResponse>(`${API_ENDPOINTS.TASKS.BASE}/${taskId}/assign`, { user_id: userId }).pipe(
      map(task => this.mapApiResponseToTask(task)),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Get tasks by status (helper method)
  getTasksByStatus(status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Observable<Task[]> {
    return this.getAllTasks({ status });
  }

  // Get tasks by user (helper method)
  getTasksByUser(userId: number): Observable<Task[]> {
    return this.getAllTasks({ assignee: userId });
  }

  // Get task statistics
  getTaskStatistics(): Observable<TaskStatistics> {
    return this.http.get<TaskStatistics>(`${API_ENDPOINTS.TASKS.BASE}/statistics`).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Add comment to task
  addComment(taskId: number, commentPayload: { text: string }): Observable<Comment> {
    return this.http.post<Comment>(API_ENDPOINTS.TASKS.COMMENTS(taskId), commentPayload).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Get all comments for a task
  getTaskComments(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(API_ENDPOINTS.TASKS.COMMENTS(taskId)).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Update comment
  updateComment(commentId: number, commentPayload: { comment: string }): Observable<Comment> {
    return this.http.put<Comment>(`${API_ENDPOINTS.TASKS.BASE}/comments/${commentId}`, commentPayload).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Delete comment
  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_ENDPOINTS.TASKS.BASE}/comments/${commentId}`).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // For dashboard - get recent activities (if needed)
  getRecentActivities(): Observable<Task[]> {
    return this.getAllTasks();
  }

  // Bulk operations
  bulkUpdateTasks(taskIds: number[], updates: UpdateTaskRequest): Observable<{ message: string; updated_count: number }> {
    return this.http.put<{ message: string; updated_count: number }>(`${API_ENDPOINTS.TASKS.BASE}/bulk`, {
      task_ids: taskIds,
      updates
    }).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Export tasks
  exportTasks(format: 'csv' | 'excel' = 'csv', filters?: TaskFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.assignee) params = params.set('assignee', filters.assignee.toString());
      if (filters.created_by) params = params.set('created_by', filters.created_by.toString());
      if (filters.priority) params = params.set('priority', filters.priority);
    }

    return this.http.get(`${API_ENDPOINTS.TASKS.BASE}/export`, { 
      params, 
      responseType: 'blob' 
    }).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }
}