// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import from your models directory instead of defining here
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';

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
  private apiUrl = 'http://127.0.0.1:5000/api/tasks';

  constructor(private http: HttpClient) { }

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

    return this.http.get<TaskApiResponse[]>(this.apiUrl, { params }).pipe(
      map(tasks => tasks.map(task => this.mapApiResponseToTask(task)))
    );
  }

  // Get single task by ID (includes comments)
  getTaskById(id: number): Observable<Task> {
    return this.http.get<TaskApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map(task => this.mapApiResponseToTask(task))
    );
  }

  // Create new task
  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<TaskApiResponse>(this.apiUrl, task).pipe(
      map(task => this.mapApiResponseToTask(task))
    );
  }

  // Update existing task
  updateTask(id: number, task: UpdateTaskRequest): Observable<Task> {
    return this.http.put<TaskApiResponse>(`${this.apiUrl}/${id}`, task).pipe(
      map(task => this.mapApiResponseToTask(task))
    );
  }

  // Delete task
  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Assign task to user
  assignTask(taskId: number, userId: number): Observable<Task> {
    return this.http.post<TaskApiResponse>(`${this.apiUrl}/${taskId}/assign`, { user_id: userId }).pipe(
      map(task => this.mapApiResponseToTask(task))
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

  // Add comment to task
  addComment(taskId: number, commentPayload: { text: string }): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${taskId}/comments`, commentPayload);
  }

  // Get all comments for a task
  getTaskComments(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${taskId}/comments`);
  }

  // Update comment
  updateComment(commentId: number, commentPayload: { comment: string }): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${commentId}`, commentPayload);
  }

  // Delete comment
  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/comments/${commentId}`);
  }

  // For dashboard - get recent activities (if needed)
  getRecentActivities(): Observable<Task[]> {
    return this.getAllTasks();
  }
}