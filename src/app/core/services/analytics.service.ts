// src/app/core/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';

// Updated interfaces to match API responses
export interface TaskCompletionRate {
  user_id: number;
  period: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  pending_tasks: number;
  in_progress_tasks: number;
  cancelled_tasks: number;
}

export interface UserPerformance {
  user_id: number;
  user_name: string;
  total_assigned_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  average_completion_time_days: number;
  tasks_by_priority: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  tasks_by_status: {
    PENDING: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CANCELLED: number;
  };
}

export interface TaskDistribution {
  total_tasks: number;
  status_distribution?: {
    [key: string]: {
      count: number;
      percentage: number;
    };
  };
  priority_distribution?: {
    [key: string]: {
      count: number;
      percentage: number;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  // private apiUrl = `${environment.apiUrl}/api/analytics`;
  private apiUrl = 'http://127.0.0.1:5000/api/analytics'; 

  constructor(private http: HttpClient) { }

  // Get task completion rate
  getTaskCompletionRate(period: string = 'month', userId?: number): Observable<TaskCompletionRate> {
    let params = new HttpParams().set('period', period);
    
    if (userId) {
      params = params.set('user_id', userId.toString());
    }
    
    return this.http.get<TaskCompletionRate>(`${this.apiUrl}/task-completion`, { params });
  }

  // Get user productivity metrics
  getUserProductivity(userId?: number): Observable<UserPerformance> {
    let params = new HttpParams();
    
    if (userId) {
      params = params.set('user_id', userId.toString());
    }
    
    return this.http.get<UserPerformance>(`${this.apiUrl}/user-productivity`, { params });
  }

  // Get task status distribution
  getTaskStatusDistribution(): Observable<TaskDistribution> {
    return this.http.get<TaskDistribution>(`${this.apiUrl}/task-status-distribution`);
  }

  // Get task priority distribution
  getTaskPriorityDistribution(): Observable<TaskDistribution> {
    return this.http.get<TaskDistribution>(`${this.apiUrl}/task-priority-distribution`);
  }
}