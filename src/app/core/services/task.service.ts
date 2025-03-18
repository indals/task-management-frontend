// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/api/tasks`;

  constructor(private http: HttpClient) { }

  getAllTasks(params?: any): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  assignTask(taskId: number, userId: number): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${taskId}/assign`, { user_id: userId });
  }

  getTasksByStatus(status: string): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, { params: { status } });
  }

  getTasksByUser(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, { params: { assignee: userId } });
  }
}