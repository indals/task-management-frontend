// src/app/core/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserPerformance, TaskDistribution } from '../models/analytics.model';
// import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  // private apiUrl = `${environment.apiUrl}/api/analytics`;
  private apiUrl = 'local';

  constructor(private http: HttpClient) { }

  getTaskCompletionRate(period: string = 'month', userId?: number): Observable<any> {
    const params: any = { period };
    if (userId) {
      params.user_id = userId;
    }
    return this.http.get<any>(`${this.apiUrl}/task-completion`, { params });
  }

  getUserProductivity(userId?: number): Observable<UserPerformance> {
    const params: any = {};
    if (userId) {
      params.user_id = userId;
    }
    return this.http.get<UserPerformance>(`${this.apiUrl}/user-productivity`, { params });
  }

  getTaskStatusDistribution(): Observable<TaskDistribution[]> {
    return this.http.get<TaskDistribution[]>(`${this.apiUrl}/task-status-distribution`);
  }

  getTaskPriorityDistribution(): Observable<TaskDistribution[]> {
    return this.http.get<TaskDistribution[]>(`${this.apiUrl}/task-priority-distribution`);
  }
}