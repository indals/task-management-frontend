// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilters,
  BulkTaskRequest,
  BulkDeleteRequest,
  TaskAssignRequest,
  TaskStatusUpdate,
  TaskApiResponse,
  TaskStatsResponse,
  TaskStatus,
  TaskPriority
} from '../models/task.model';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Helper method to build HTTP params from filters
  private buildHttpParams(filters?: TaskFilters): HttpParams {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.priority) params = params.set('priority', filters.priority);
      if (filters.assignee) params = params.set('assignee', filters.assignee.toString());
      if (filters.created_by) params = params.set('created_by', filters.created_by.toString());
      if (filters.project_id) params = params.set('project_id', filters.project_id.toString());
      if (filters.due_date_from) params = params.set('due_date_from', filters.due_date_from);
      if (filters.due_date_to) params = params.set('due_date_to', filters.due_date_to);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params = params.append('tags', tag));
      }
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
      if (filters.sort_by) params = params.set('sort_by', filters.sort_by);
      if (filters.sort_order) params = params.set('sort_order', filters.sort_order);
    }

    return params;
  }

  // Get all tasks with optional filters and pagination
  getAllTasks(filters?: TaskFilters): Observable<Task[]> {
    this.loadingSubject.next(true);
    const params = this.buildHttpParams(filters);

    return this.http.get<TaskApiResponse>(API_ENDPOINTS.TASKS.BASE, { params }).pipe(
      map(response => {
        const tasks = Array.isArray(response.data) ? response.data : [response.data];
        return tasks as Task[];
      }),
      tap(tasks => {
        this.tasksSubject.next(tasks);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Get tasks by project ID
  getTasksByProject(projectId: number, filters?: TaskFilters): Observable<Task[]> {
    this.loadingSubject.next(true);
    const params = this.buildHttpParams(filters);

    return this.http.get<TaskApiResponse>(API_ENDPOINTS.TASKS.BY_PROJECT(projectId), { params }).pipe(
      map(response => {
        const tasks = Array.isArray(response.data) ? response.data : [response.data];
        return tasks as Task[];
      }),
      tap(tasks => {
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Get single task by ID (includes comments and subtasks)
  getTaskById(id: number): Observable<Task> {
    return this.http.get<TaskApiResponse>(API_ENDPOINTS.TASKS.BY_ID(id)).pipe(
      map(response => response.data as Task),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Create new task
  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<TaskApiResponse>(API_ENDPOINTS.TASKS.BASE, task).pipe(
      map(response => response.data as Task),
      tap(newTask => {
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next([newTask, ...currentTasks]);
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Create task within a project
  createTaskInProject(projectId: number, task: CreateTaskRequest): Observable<Task> {
    const taskWithProject = { ...task, project_id: projectId };
    return this.http.post<TaskApiResponse>(API_ENDPOINTS.TASKS.BY_PROJECT(projectId), taskWithProject).pipe(
      map(response => response.data as Task),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Update existing task
  updateTask(id: number, task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<TaskApiResponse>(API_ENDPOINTS.TASKS.BY_ID(id), task).pipe(
      map(response => response.data as Task),
      tap(updatedTask => {
        const currentTasks = this.tasksSubject.value;
        const index = currentTasks.findIndex(t => t.id === id);
        if (index !== -1) {
          currentTasks[index] = updatedTask;
          this.tasksSubject.next([...currentTasks]);
        }
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Delete task
  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.TASKS.BY_ID(id)).pipe(
      tap(() => {
        const currentTasks = this.tasksSubject.value;
        const filteredTasks = currentTasks.filter(t => t.id !== id);
        this.tasksSubject.next(filteredTasks);
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Delete task from project
  deleteTaskFromProject(projectId: number, taskId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_ENDPOINTS.TASKS.BY_PROJECT(projectId)}/${taskId}`).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Bulk create tasks
  bulkCreateTasks(bulkRequest: BulkTaskRequest): Observable<Task[]> {
    return this.http.post<TaskApiResponse>(API_ENDPOINTS.TASKS.BULK, bulkRequest).pipe(
      map(response => response.data as Task[]),
      tap(newTasks => {
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next([...newTasks, ...currentTasks]);
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Bulk delete tasks
  bulkDeleteTasks(deleteRequest: BulkDeleteRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(API_ENDPOINTS.TASKS.BULK_DELETE, deleteRequest).pipe(
      tap(() => {
        const currentTasks = this.tasksSubject.value;
        const filteredTasks = currentTasks.filter(t => !deleteRequest.taskIds.includes(t.id));
        this.tasksSubject.next(filteredTasks);
      }),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Assign task to user
  assignTask(taskId: number, assignRequest: TaskAssignRequest): Observable<Task> {
    return this.http.post<TaskApiResponse>(API_ENDPOINTS.TASKS.ASSIGN(taskId), assignRequest).pipe(
      map(response => response.data as Task),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Assign task in project
  assignTaskInProject(projectId: number, taskId: number, assignRequest: TaskAssignRequest): Observable<Task> {
    return this.http.post<TaskApiResponse>(API_ENDPOINTS.TASKS.ASSIGNEES(projectId, taskId), assignRequest).pipe(
      map(response => response.data as Task),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Remove assignee from task
  unassignTask(taskId: number, assignRequest: TaskAssignRequest): Observable<Task> {
    return this.http.delete<TaskApiResponse>(API_ENDPOINTS.TASKS.UNASSIGN(taskId), { body: assignRequest }).pipe(
      map(response => response.data as Task),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Remove assignee from task in project
  removeAssigneeFromProject(projectId: number, taskId: number, assignRequest: TaskAssignRequest): Observable<Task> {
    return this.http.delete<TaskApiResponse>(API_ENDPOINTS.TASKS.ASSIGNEES(projectId, taskId), { body: assignRequest }).pipe(
      map(response => response.data as Task),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Update task status
  updateTaskStatus(taskId: number, statusUpdate: TaskStatusUpdate): Observable<Task> {
    return this.http.patch<TaskApiResponse>(API_ENDPOINTS.TASKS.STATUS(taskId), statusUpdate).pipe(
      map(response => response.data as Task),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Update task status in project
  updateTaskStatusInProject(projectId: number, taskId: number, statusUpdate: TaskStatusUpdate): Observable<Task> {
    return this.http.patch<TaskApiResponse>(API_ENDPOINTS.TASKS.UPDATE_STATUS(projectId, taskId), statusUpdate).pipe(
      map(response => response.data as Task),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Get tasks by status (helper method)
  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.getAllTasks({ status });
  }

  // Get tasks by user (helper method)
  getTasksByUser(userId: number): Observable<Task[]> {
    return this.getAllTasks({ assignee: userId });
  }

  // Get tasks by priority (helper method)
  getTasksByPriority(priority: TaskPriority): Observable<Task[]> {
    return this.getAllTasks({ priority });
  }

  // Get overdue tasks
  getOverdueTasks(): Observable<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAllTasks({ due_date_to: today, status: TaskStatus.TODO });
  }

  // Comment Management
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

  // Get task statistics
  getTaskStats(): Observable<TaskStatsResponse> {
    return this.http.get<TaskStatsResponse>(API_ENDPOINTS.ANALYTICS.TASK_STATS).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // For dashboard - get recent activities
  getRecentActivities(limit: number = 10): Observable<Task[]> {
    return this.getAllTasks({ limit, sort_by: 'updated_at', sort_order: 'desc' });
  }

  // Search tasks
  searchTasks(query: string, filters?: Omit<TaskFilters, 'search'>): Observable<Task[]> {
    return this.getAllTasks({ ...filters, search: query });
  }

  // Clear tasks cache
  clearTasksCache(): void {
    this.tasksSubject.next([]);
  }
}