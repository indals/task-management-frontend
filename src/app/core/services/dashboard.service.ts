// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { TaskStatistics } from './task.service';

export interface DashboardOverview {
  user_stats: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    overdue_tasks: number;
    completion_rate: number;
  };
  project_stats: {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    projects_behind_schedule: number;
  };
  team_stats: {
    total_team_members: number;
    active_members: number;
    tasks_assigned_today: number;
    tasks_completed_today: number;
  };
  recent_activities: RecentActivity[];
  upcoming_deadlines: UpcomingDeadline[];
}

export interface RecentActivity {
  id: number;
  type: 'task_created' | 'task_completed' | 'task_assigned' | 'project_created' | 'comment_added';
  title: string;
  description: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  entity: {
    id: number;
    name: string;
    type: 'task' | 'project' | 'comment';
  };
  timestamp: string;
  metadata?: any;
}

export interface UpcomingDeadline {
  id: number;
  title: string;
  type: 'task' | 'project';
  due_date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee?: {
    id: number;
    name: string;
    avatar?: string;
  };
  project?: {
    id: number;
    name: string;
  };
  days_remaining: number;
  is_overdue: boolean;
}

export interface ChartData {
  task_completion_trend: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  };
  task_distribution: {
    labels: string[];
    data: number[];
    backgroundColor: string[];
  };
  project_progress: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
    }[];
  };
  user_productivity: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
    }[];
  };
  priority_breakdown: {
    labels: string[];
    data: number[];
    backgroundColor: string[];
  };
}

export interface ProductivityMetrics {
  daily_completed_tasks: number;
  weekly_completed_tasks: number;
  monthly_completed_tasks: number;
  average_completion_time: number;
  productivity_score: number;
  efficiency_trend: {
    date: string;
    score: number;
  }[];
  top_performing_users: {
    id: number;
    name: string;
    completed_tasks: number;
    completion_rate: number;
    avatar?: string;
  }[];
}

export interface DashboardFilters {
  date_range?: {
    start_date: string;
    end_date: string;
  };
  project_id?: number;
  team_member?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  include_completed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private overviewSubject = new BehaviorSubject<DashboardOverview | null>(null);
  public overview$ = this.overviewSubject.asObservable();

  private chartDataSubject = new BehaviorSubject<ChartData | null>(null);
  public chartData$ = this.chartDataSubject.asObservable();

  private productivitySubject = new BehaviorSubject<ProductivityMetrics | null>(null);
  public productivity$ = this.productivitySubject.asObservable();

  private recentActivitiesSubject = new BehaviorSubject<RecentActivity[]>([]);
  public recentActivities$ = this.recentActivitiesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get dashboard overview
  getDashboardOverview(filters?: DashboardFilters): Observable<DashboardOverview> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.date_range) {
        params = params.set('start_date', filters.date_range.start_date);
        params = params.set('end_date', filters.date_range.end_date);
      }
      if (filters.project_id) {
        params = params.set('project_id', filters.project_id.toString());
      }
      if (filters.team_member) {
        params = params.set('team_member', filters.team_member.toString());
      }
      if (filters.priority) {
        params = params.set('priority', filters.priority);
      }
      if (filters.include_completed !== undefined) {
        params = params.set('include_completed', filters.include_completed.toString());
      }
    }

    return this.http.get<DashboardOverview>(API_ENDPOINTS.DASHBOARD.OVERVIEW, { params }).pipe(
      tap(overview => {
        this.overviewSubject.next(overview);
        this.recentActivitiesSubject.next(overview.recent_activities);
      })
    );
  }

  // Get recent activities
  getRecentActivities(limit: number = 20, filters?: DashboardFilters): Observable<RecentActivity[]> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (filters) {
      if (filters.date_range) {
        params = params.set('start_date', filters.date_range.start_date);
        params = params.set('end_date', filters.date_range.end_date);
      }
      if (filters.project_id) {
        params = params.set('project_id', filters.project_id.toString());
      }
      if (filters.team_member) {
        params = params.set('team_member', filters.team_member.toString());
      }
    }

    return this.http.get<RecentActivity[]>(API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITIES, { params }).pipe(
      tap(activities => this.recentActivitiesSubject.next(activities))
    );
  }

  // Get dashboard statistics
  getDashboardStatistics(filters?: DashboardFilters): Observable<TaskStatistics> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.date_range) {
        params = params.set('start_date', filters.date_range.start_date);
        params = params.set('end_date', filters.date_range.end_date);
      }
      if (filters.project_id) {
        params = params.set('project_id', filters.project_id.toString());
      }
    }

    return this.http.get<TaskStatistics>(API_ENDPOINTS.DASHBOARD.STATISTICS, { params });
  }

  // Get chart data
  getChartData(type?: string, filters?: DashboardFilters): Observable<ChartData> {
    let params = new HttpParams();
    
    if (type) {
      params = params.set('type', type);
    }
    
    if (filters) {
      if (filters.date_range) {
        params = params.set('start_date', filters.date_range.start_date);
        params = params.set('end_date', filters.date_range.end_date);
      }
      if (filters.project_id) {
        params = params.set('project_id', filters.project_id.toString());
      }
    }

    return this.http.get<ChartData>(API_ENDPOINTS.DASHBOARD.CHARTS, { params }).pipe(
      tap(chartData => this.chartDataSubject.next(chartData))
    );
  }

  // Get productivity metrics
  getProductivityMetrics(userId?: number, filters?: DashboardFilters): Observable<ProductivityMetrics> {
    let params = new HttpParams();
    
    if (userId) {
      params = params.set('user_id', userId.toString());
    }
    
    if (filters?.date_range) {
      params = params.set('start_date', filters.date_range.start_date);
      params = params.set('end_date', filters.date_range.end_date);
    }

    return this.http.get<ProductivityMetrics>(`${API_ENDPOINTS.DASHBOARD.STATISTICS}/productivity`, { params }).pipe(
      tap(metrics => this.productivitySubject.next(metrics))
    );
  }

  // Get upcoming deadlines
  getUpcomingDeadlines(days: number = 7): Observable<UpcomingDeadline[]> {
    const params = new HttpParams().set('days', days.toString());
    
    return this.http.get<UpcomingDeadline[]>(`${API_ENDPOINTS.DASHBOARD.OVERVIEW}/deadlines`, { params });
  }

  // Get task completion trend
  getTaskCompletionTrend(period: 'week' | 'month' | 'quarter' = 'month'): Observable<any> {
    const params = new HttpParams().set('period', period);
    
    return this.http.get(`${API_ENDPOINTS.DASHBOARD.CHARTS}/completion-trend`, { params });
  }

  // Get project progress summary
  getProjectProgressSummary(): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.DASHBOARD.OVERVIEW}/project-progress`);
  }

  // Get team performance metrics
  getTeamPerformanceMetrics(teamId?: number): Observable<any> {
    let params = new HttpParams();
    if (teamId) {
      params = params.set('team_id', teamId.toString());
    }
    
    return this.http.get(`${API_ENDPOINTS.DASHBOARD.STATISTICS}/team-performance`, { params });
  }

  // Get personal dashboard data
  getPersonalDashboard(): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.DASHBOARD.OVERVIEW}/personal`);
  }

  // Get workload distribution
  getWorkloadDistribution(): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.DASHBOARD.CHARTS}/workload-distribution`);
  }

  // Export dashboard data
  exportDashboardData(format: 'pdf' | 'excel' = 'pdf', filters?: DashboardFilters): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filters) {
      if (filters.date_range) {
        params = params.set('start_date', filters.date_range.start_date);
        params = params.set('end_date', filters.date_range.end_date);
      }
      if (filters.project_id) {
        params = params.set('project_id', filters.project_id.toString());
      }
    }

    return this.http.get(`${API_ENDPOINTS.DASHBOARD.OVERVIEW}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }

  // Refresh all dashboard data
  refreshDashboard(filters?: DashboardFilters): Observable<any> {
    return combineLatest([
      this.getDashboardOverview(filters),
      this.getChartData(undefined, filters),
      this.getProductivityMetrics(undefined, filters)
    ]);
  }

  // Real-time updates for dashboard (if WebSocket is available)
  subscribeToRealTimeUpdates(): void {
    // Implementation would depend on WebSocket setup
    // This is a placeholder for real-time functionality
  }

  // Get current overview from subject
  getCurrentOverview(): DashboardOverview | null {
    return this.overviewSubject.value;
  }

  // Get current chart data from subject
  getCurrentChartData(): ChartData | null {
    return this.chartDataSubject.value;
  }

  // Get current productivity metrics from subject
  getCurrentProductivityMetrics(): ProductivityMetrics | null {
    return this.productivitySubject.value;
  }

  // Get current recent activities from subject
  getCurrentRecentActivities(): RecentActivity[] {
    return this.recentActivitiesSubject.value;
  }
}