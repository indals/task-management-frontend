// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';
import { API_ENDPOINTS } from '../constants/api.constants';

// Request interfaces
export interface CreateTaskRequest {
  title: string;
  assigned_user: string;
  completed?: boolean;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string;
  assigneeId?: number;
  project_id?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  assigned_user?: string;
  completed?: boolean;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string;
  assigneeId?: number;
}

export interface TaskFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignee?: number;
  created_by?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  project_id?: number;
  due_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BulkCreateTaskRequest {
  tasks: CreateTaskRequest[];
}

export interface BulkDeleteRequest {
  taskIds: number[];
}

export interface TaskStatistics {
  total: number;
  completed: number;
  in_progress: number;
  pending: number;
  cancelled: number;
  overdue: number;
  by_priority: {
    low: number;
    medium: number;
    high: number;
  };
  by_assignee: {
    [userId: number]: number;
  };
}

export interface SearchRequest {
  query: string;
  filters?: TaskFilters;
}

// API response interface
interface TaskApiResponse {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigned_user: string;
  assigned_to?: User;
  created_by: User;
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed: boolean;
  comments_count?: number;
  comments?: Comment[];
  project_id?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private statisticsSubject = new BehaviorSubject<TaskStatistics | null>(null);
  public statistics$ = this.statisticsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Helper method to map API response to Task model
  private mapApiResponseToTask(apiTask: TaskApiResponse): Task {
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description || '',
      status: apiTask.status,
      priority: apiTask.priority,
      assigned_user: apiTask.assigned_user,
      assigned_to: apiTask.assigned_to,
      assignee: apiTask.assigned_to,
      created_by: apiTask.created_by,
      due_date: apiTask.due_date,
      dueDate: apiTask.due_date,
      created_at: apiTask.created_at,
      createdAt: apiTask.created_at,
      updated_at: apiTask.updated_at,
      updatedAt: apiTask.updated_at,
      completed: apiTask.completed,
      subtasks: [],
      comments: apiTask.comments || [],
      project_id: apiTask.project_id
    };
  }

  // Get all tasks with optional filters and pagination
  getAllTasks(filters?: TaskFilters): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TaskFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<TaskApiResponse>>(API_ENDPOINTS.TASKS.BASE, { params }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(task => this.mapApiResponseToTask(task))
      })),
      tap(response => this.tasksSubject.next(response.data))
    );
  }

  // Get single task by ID
  getTaskById(id: number): Observable<Task> {
    return this.http.get<TaskApiResponse>(API_ENDPOINTS.TASKS.BY_ID(id)).pipe(
      map(task => this.mapApiResponseToTask(task))
    );
  }

  // Create new task
  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<TaskApiResponse>(API_ENDPOINTS.TASKS.BASE, task).pipe(
      map(task => this.mapApiResponseToTask(task)),
      tap(() => this.refreshTasks())
    );
  }

  // Update existing task
  updateTask(id: number, task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<TaskApiResponse>(API_ENDPOINTS.TASKS.BY_ID(id), task).pipe(
      map(task => this.mapApiResponseToTask(task)),
      tap(() => this.refreshTasks())
    );
  }

  // Delete task
  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.TASKS.BY_ID(id)).pipe(
      tap(() => this.refreshTasks())
    );
  }

  // Bulk create tasks
  bulkCreateTasks(tasks: CreateTaskRequest[]): Observable<Task[]> {
    return this.http.post<TaskApiResponse[]>(API_ENDPOINTS.TASKS.BULK, tasks).pipe(
      map(tasks => tasks.map(task => this.mapApiResponseToTask(task))),
      tap(() => this.refreshTasks())
    );
  }

  // Bulk delete tasks
  bulkDeleteTasks(taskIds: number[]): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.TASKS.BULK_DELETE, {
      body: { taskIds }
    }).pipe(
      tap(() => this.refreshTasks())
    );
  }

  // Assign task to user
  assignTask(taskId: number, userId: number): Observable<Task> {
    return this.http.post<TaskApiResponse>(API_ENDPOINTS.TASKS.ASSIGN(taskId), { 
      user_id: userId 
    }).pipe(
      map(task => this.mapApiResponseToTask(task)),
      tap(() => this.refreshTasks())
    );
  }

  // Get tasks by status
  getTasksByStatus(status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Observable<Task[]> {
    return this.http.get<TaskApiResponse[]>(API_ENDPOINTS.TASKS.BY_STATUS(status)).pipe(
      map(tasks => tasks.map(task => this.mapApiResponseToTask(task)))
    );
  }

  // Get tasks by user
  getTasksByUser(userId: number): Observable<Task[]> {
    return this.http.get<TaskApiResponse[]>(API_ENDPOINTS.TASKS.BY_USER(userId)).pipe(
      map(tasks => tasks.map(task => this.mapApiResponseToTask(task)))
    );
  }

  // Get tasks by priority
  getTasksByPriority(priority: 'LOW' | 'MEDIUM' | 'HIGH'): Observable<Task[]> {
    return this.http.get<TaskApiResponse[]>(API_ENDPOINTS.TASKS.BY_PRIORITY(priority)).pipe(
      map(tasks => tasks.map(task => this.mapApiResponseToTask(task)))
    );
  }

  // Search tasks
  searchTasks(query: string, filters?: TaskFilters): Observable<Task[]> {
    let params = new HttpParams().set('q', query);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TaskFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<TaskApiResponse[]>(API_ENDPOINTS.TASKS.SEARCH, { params }).pipe(
      map(tasks => tasks.map(task => this.mapApiResponseToTask(task)))
    );
  }

  // Get task statistics
  getTaskStatistics(): Observable<TaskStatistics> {
    return this.http.get<TaskStatistics>(API_ENDPOINTS.TASKS.STATISTICS).pipe(
      tap(stats => this.statisticsSubject.next(stats))
    );
  }

  // Export tasks
  exportTasks(format: 'csv' | 'excel' | 'pdf' = 'csv', filters?: TaskFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TaskFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(API_ENDPOINTS.TASKS.EXPORT, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Comment management
  addComment(taskId: number, commentPayload: { text: string }): Observable<Comment> {
    return this.http.post<Comment>(API_ENDPOINTS.TASKS.COMMENTS(taskId), commentPayload);
  }

  getTaskComments(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(API_ENDPOINTS.TASKS.COMMENTS(taskId));
  }

  updateComment(commentId: number, commentPayload: { comment: string }): Observable<Comment> {
    return this.http.put<Comment>(API_ENDPOINTS.TASKS.COMMENT_BY_ID(commentId), commentPayload);
  }

  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.TASKS.COMMENT_BY_ID(commentId));
  }

  // Utility methods
  getRecentActivities(): Observable<Task[]> {
    return this.getAllTasks({ limit: 10 }).pipe(
      map(response => response.data)
    );
  }

  getOverdueTasks(): Observable<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAllTasks({ 
      status: 'PENDING',
      due_date: today 
    }).pipe(
      map(response => response.data.filter(task => 
        task.due_date && new Date(task.due_date) < new Date()
      ))
    );
  }

  getTasksCompletedToday(): Observable<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAllTasks({ status: 'COMPLETED' }).pipe(
      map(response => response.data.filter(task => 
        task.updated_at && task.updated_at.startsWith(today)
      ))
    );
  }

  // Helper method to refresh tasks
  private refreshTasks(): void {
    this.getAllTasks().subscribe();
  }

  // Get current tasks from subject
  getCurrentTasks(): Task[] {
    return this.tasksSubject.value;
  }

  // Get current statistics from subject
  getCurrentStatistics(): TaskStatistics | null {
    return this.statisticsSubject.value;
  }
}