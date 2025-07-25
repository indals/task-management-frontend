// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilters, 
  BulkTaskUpdate,
  TaskStats,
  Subtask,
  CreateSubtaskRequest,
  UpdateSubtaskRequest,
  TaskAttachment,
  TaskActivity,
  TaskTemplate
} from '../models/task.model';
import { Comment } from '../models/comment.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api.interfaces';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Task CRUD Operations
  getAllTasks(filters?: TaskFilters): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status?.length) {
        filters.status.forEach(status => params = params.append('status', status));
      }
      if (filters.priority?.length) {
        filters.priority.forEach(priority => params = params.append('priority', priority));
      }
      if (filters.assignee_id?.length) {
        filters.assignee_id.forEach(id => params = params.append('assignee_id', id.toString()));
      }
      if (filters.created_by_id?.length) {
        filters.created_by_id.forEach(id => params = params.append('created_by_id', id.toString()));
      }
      if (filters.project_id?.length) {
        filters.project_id.forEach(id => params = params.append('project_id', id.toString()));
      }
      if (filters.category_id?.length) {
        filters.category_id.forEach(id => params = params.append('category_id', id.toString()));
      }
      if (filters.tags?.length) {
        filters.tags.forEach(tag => params = params.append('tags', tag));
      }
      if (filters.due_date_from) params = params.set('due_date_from', filters.due_date_from);
      if (filters.due_date_to) params = params.set('due_date_to', filters.due_date_to);
      if (filters.created_date_from) params = params.set('created_date_from', filters.created_date_from);
      if (filters.created_date_to) params = params.set('created_date_to', filters.created_date_to);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.is_archived !== undefined) params = params.set('is_archived', filters.is_archived.toString());
      if (filters.is_overdue !== undefined) params = params.set('is_overdue', filters.is_overdue.toString());
      if (filters.has_no_assignee !== undefined) params = params.set('has_no_assignee', filters.has_no_assignee.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
      if (filters.sort_order) params = params.set('sort_order', filters.sort_order);
    }

    return this.http.get<PaginatedResponse<Task>>(API_ENDPOINTS.TASKS.BASE, { params })
      .pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(API_ENDPOINTS.TASKS.BY_ID(id))
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(API_ENDPOINTS.TASKS.BASE, task)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  updateTask(id: number, task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<ApiResponse<Task>>(API_ENDPOINTS.TASKS.BY_ID(id), task)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.TASKS.BY_ID(id))
      .pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Task Assignment
  assignTask(taskId: number, userId: number): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(API_ENDPOINTS.TASKS.ASSIGN(taskId), { user_id: userId })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  unassignTask(taskId: number): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(API_ENDPOINTS.TASKS.UNASSIGN(taskId), {})
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Task Status Management
  updateTaskStatus(taskId: number, status: string): Observable<Task> {
    return this.http.patch<ApiResponse<Task>>(API_ENDPOINTS.TASKS.STATUS(taskId), { status })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Bulk Operations
  bulkUpdateTasks(bulkUpdate: BulkTaskUpdate): Observable<{ message: string; updated_count: number }> {
    return this.http.patch<{ message: string; updated_count: number }>(
      API_ENDPOINTS.TASKS.BULK_UPDATE, 
      bulkUpdate
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  bulkDeleteTasks(taskIds: number[]): Observable<{ message: string; deleted_count: number }> {
    return this.http.delete<{ message: string; deleted_count: number }>(
      API_ENDPOINTS.TASKS.BULK_DELETE,
      { body: { task_ids: taskIds } }
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Search and Export
  searchTasks(query: string, filters?: Partial<TaskFilters>): Observable<Task[]> {
    let params = new HttpParams().set('q', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v.toString()));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<ApiResponse<Task[]>>(API_ENDPOINTS.TASKS.SEARCH, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  exportTasks(filters?: TaskFilters, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      // Add filter parameters similar to getAllTasks
      Object.entries(filters).forEach(([key, value]) => {
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
    }).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Subtask Operations
  createSubtask(taskId: number, subtask: CreateSubtaskRequest): Observable<Subtask> {
    return this.http.post<ApiResponse<Subtask>>(
      `${API_ENDPOINTS.TASKS.BY_ID(taskId)}/subtasks`, 
      subtask
    ).pipe(
      map(response => response.data),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  updateSubtask(taskId: number, subtaskId: number, subtask: UpdateSubtaskRequest): Observable<Subtask> {
    return this.http.put<ApiResponse<Subtask>>(
      `${API_ENDPOINTS.TASKS.BY_ID(taskId)}/subtasks/${subtaskId}`, 
      subtask
    ).pipe(
      map(response => response.data),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  deleteSubtask(taskId: number, subtaskId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${API_ENDPOINTS.TASKS.BY_ID(taskId)}/subtasks/${subtaskId}`
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Comment Operations
  getTaskComments(taskId: number): Observable<Comment[]> {
    return this.http.get<ApiResponse<Comment[]>>(API_ENDPOINTS.TASKS.COMMENTS(taskId))
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  addComment(taskId: number, content: string): Observable<Comment> {
    return this.http.post<ApiResponse<Comment>>(
      API_ENDPOINTS.TASKS.COMMENTS(taskId), 
      { content }
    ).pipe(
      map(response => response.data),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  updateComment(taskId: number, commentId: number, content: string): Observable<Comment> {
    return this.http.put<ApiResponse<Comment>>(
      API_ENDPOINTS.TASKS.COMMENT_BY_ID(taskId, commentId), 
      { content }
    ).pipe(
      map(response => response.data),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  deleteComment(taskId: number, commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      API_ENDPOINTS.TASKS.COMMENT_BY_ID(taskId, commentId)
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Attachment Operations
  getTaskAttachments(taskId: number): Observable<TaskAttachment[]> {
    return this.http.get<ApiResponse<TaskAttachment[]>>(API_ENDPOINTS.ATTACHMENTS.TASK_ATTACHMENTS(taskId))
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  uploadAttachment(taskId: number, file: File): Observable<TaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('task_id', taskId.toString());

    return this.http.post<ApiResponse<TaskAttachment>>(API_ENDPOINTS.ATTACHMENTS.UPLOAD, formData)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  deleteAttachment(attachmentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.ATTACHMENTS.BY_ID(attachmentId))
      .pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Task Activity/History
  getTaskActivity(taskId: number): Observable<TaskActivity[]> {
    return this.http.get<ApiResponse<TaskActivity[]>>(`${API_ENDPOINTS.TASKS.BY_ID(taskId)}/activity`)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Task Statistics
  getTaskStats(filters?: Partial<TaskFilters>): Observable<TaskStats> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v.toString()));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<ApiResponse<TaskStats>>(`${API_ENDPOINTS.TASKS.BASE}/stats`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Task Templates
  getTaskTemplates(): Observable<TaskTemplate[]> {
    return this.http.get<ApiResponse<TaskTemplate[]>>(`${API_ENDPOINTS.TASKS.BASE}/templates`)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  createTaskFromTemplate(templateId: number, overrides?: Partial<CreateTaskRequest>): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(
      `${API_ENDPOINTS.TASKS.BASE}/templates/${templateId}/create`, 
      overrides || {}
    ).pipe(
      map(response => response.data),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Helper methods for common operations
  getMyTasks(filters?: Partial<TaskFilters>): Observable<PaginatedResponse<Task>> {
    return this.getAllTasks({ ...filters, assignee_id: [this.getCurrentUserId()] });
  }

  getOverdueTasks(filters?: Partial<TaskFilters>): Observable<PaginatedResponse<Task>> {
    return this.getAllTasks({ ...filters, is_overdue: true });
  }

  getTasksByStatus(status: string, filters?: Partial<TaskFilters>): Observable<PaginatedResponse<Task>> {
    return this.getAllTasks({ ...filters, status: [status as any] });
  }

  getTasksByPriority(priority: string, filters?: Partial<TaskFilters>): Observable<PaginatedResponse<Task>> {
    return this.getAllTasks({ ...filters, priority: [priority as any] });
  }

  private getCurrentUserId(): number {
    // This should get the current user ID from auth service
    // For now, return 0 as placeholder
    return 0;
  }
}