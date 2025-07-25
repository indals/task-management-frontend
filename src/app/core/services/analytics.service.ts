// src/app/core/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';
import { 
  TaskCompletionAnalytics,
  UserProductivityAnalytics,
  TaskStatusDistribution,
  TaskPriorityDistribution,
  ProjectAnalytics,
  TeamPerformanceAnalytics,
  DashboardStats,
  TimeTrackingAnalytics,
  AnalyticsFilters,
  ReportGenerationRequest,
  TaskCompletionAnalyticsResponse,
  UserProductivityAnalyticsResponse,
  TaskStatusDistributionResponse,
  TaskPriorityDistributionResponse,
  ProjectAnalyticsResponse,
  TeamPerformanceAnalyticsResponse,
  DashboardStatsResponse,
  TimeTrackingAnalyticsResponse,
  calculateProductivityScore,
  formatAnalyticsNumber,
  getAnalyticsTrend
} from '../models/analytics.model';
import { ApiResponse } from '../interfaces/api.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public dashboardStats$ = this.dashboardStatsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Dashboard Analytics
  getDashboardStats(): Observable<DashboardStats> {
    this.loadingSubject.next(true);

    return this.http.get<DashboardStatsResponse>(API_ENDPOINTS.DASHBOARD.STATS)
      .pipe(
        map(response => response.data),
        tap(stats => {
          this.dashboardStatsSubject.next(stats);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          return this.errorHandler.handleError(error);
        })
      );
  }

  getRecentActivities(): Observable<DashboardStats['recent_activities']> {
    return this.http.get<ApiResponse<DashboardStats['recent_activities']>>(API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITIES)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  getTaskDistribution(): Observable<DashboardStats['task_distribution']> {
    return this.http.get<ApiResponse<DashboardStats['task_distribution']>>(API_ENDPOINTS.DASHBOARD.TASK_DISTRIBUTION)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  getTeamPerformance(): Observable<DashboardStats['productivity_trends']> {
    return this.http.get<ApiResponse<DashboardStats['productivity_trends']>>(API_ENDPOINTS.DASHBOARD.TEAM_PERFORMANCE)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Task Analytics
  getTaskCompletionAnalytics(filters?: AnalyticsFilters): Observable<TaskCompletionAnalytics> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<TaskCompletionAnalyticsResponse>(API_ENDPOINTS.ANALYTICS.TASK_COMPLETION, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  getTaskStatusDistribution(): Observable<TaskStatusDistribution> {
    return this.http.get<TaskStatusDistributionResponse>(API_ENDPOINTS.ANALYTICS.TASK_STATUS_DISTRIBUTION)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  getTaskPriorityDistribution(): Observable<TaskPriorityDistribution> {
    return this.http.get<TaskPriorityDistributionResponse>(API_ENDPOINTS.ANALYTICS.TASK_PRIORITY_DISTRIBUTION)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // User Analytics
  getUserProductivityAnalytics(userId?: number): Observable<UserProductivityAnalytics> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('user_id', userId.toString());
    }

    return this.http.get<UserProductivityAnalyticsResponse>(API_ENDPOINTS.ANALYTICS.USER_PRODUCTIVITY, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Project Analytics
  getProjectAnalytics(projectId: number, filters?: AnalyticsFilters): Observable<ProjectAnalytics> {
    let params = new HttpParams().set('project_id', projectId.toString());
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ProjectAnalyticsResponse>(`${API_ENDPOINTS.ANALYTICS.BASE}/project`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Team Analytics
  getTeamPerformanceAnalytics(teamId: number, filters?: AnalyticsFilters): Observable<TeamPerformanceAnalytics> {
    let params = new HttpParams().set('team_id', teamId.toString());
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<TeamPerformanceAnalyticsResponse>(`${API_ENDPOINTS.ANALYTICS.BASE}/team`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Time Tracking Analytics
  getTimeTrackingAnalytics(filters?: AnalyticsFilters): Observable<TimeTrackingAnalytics> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<TimeTrackingAnalyticsResponse>(`${API_ENDPOINTS.ANALYTICS.BASE}/time-tracking`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Comparative Analytics
  getCompletionRateComparison(period: 'week' | 'month' | 'quarter' | 'year'): Observable<{
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    change_percentage: number;
  }> {
    const params = new HttpParams().set('period', period);

    return this.http.get<ApiResponse<{
      current: number;
      previous: number;
      trend: 'up' | 'down' | 'stable';
      change_percentage: number;
    }>>(`${API_ENDPOINTS.ANALYTICS.BASE}/completion-rate-comparison`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  getProductivityTrend(userId?: number, period: 'week' | 'month' | 'quarter' = 'month'): Observable<Array<{
    date: string;
    productivity_score: number;
    tasks_completed: number;
    hours_logged: number;
  }>> {
    let params = new HttpParams().set('period', period);
    if (userId) {
      params = params.set('user_id', userId.toString());
    }

    return this.http.get<ApiResponse<Array<{
      date: string;
      productivity_score: number;
      tasks_completed: number;
      hours_logged: number;
    }>>>(`${API_ENDPOINTS.ANALYTICS.BASE}/productivity-trend`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Report Generation
  generateReport(request: ReportGenerationRequest): Observable<Blob> {
    return this.http.post(`${API_ENDPOINTS.ANALYTICS.BASE}/generate-report`, request, {
      responseType: 'blob'
    })
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  exportAnalytics(type: string, filters?: AnalyticsFilters, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Observable<Blob> {
    let params = new HttpParams()
      .set('type', type)
      .set('format', format);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${API_ENDPOINTS.ANALYTICS.BASE}/export`, {
      params,
      responseType: 'blob'
    })
      .pipe(
        catchError(this.errorHandler.handleError)
      );
  }

  // Performance Benchmarking
  getBenchmarkData(metric: string, period: 'week' | 'month' | 'quarter' | 'year'): Observable<{
    current_value: number;
    industry_average: number;
    percentile_rank: number;
    recommendations: string[];
  }> {
    const params = new HttpParams()
      .set('metric', metric)
      .set('period', period);

    return this.http.get<ApiResponse<{
      current_value: number;
      industry_average: number;
      percentile_rank: number;
      recommendations: string[];
    }>>(`${API_ENDPOINTS.ANALYTICS.BASE}/benchmark`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Predictive Analytics
  getPredictiveInsights(type: 'completion_date' | 'resource_needs' | 'bottlenecks', filters?: AnalyticsFilters): Observable<{
    predictions: Array<{
      date: string;
      predicted_value: number;
      confidence_level: number;
    }>;
    insights: string[];
    recommendations: string[];
  }> {
    let params = new HttpParams().set('type', type);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<{
      predictions: Array<{
        date: string;
        predicted_value: number;
        confidence_level: number;
      }>;
      insights: string[];
      recommendations: string[];
    }>>(`${API_ENDPOINTS.ANALYTICS.BASE}/predictions`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError)
      );
  }

  // Utility Methods
  calculateProductivityScore(metrics: UserProductivityAnalytics['performance_metrics']): number {
    return calculateProductivityScore(metrics);
  }

  formatAnalyticsNumber(value: number, type: 'percentage' | 'hours' | 'count' | 'score'): string {
    return formatAnalyticsNumber(value, type);
  }

  getAnalyticsTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    return getAnalyticsTrend(current, previous);
  }

  // Chart Data Preparation
  prepareChartData(data: any[], type: 'line' | 'bar' | 'pie' | 'doughnut'): any {
    switch (type) {
      case 'line':
        return {
          labels: data.map(item => item.date || item.label),
          datasets: [{
            data: data.map(item => item.value || item.count),
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.4
          }]
        };
      case 'bar':
        return {
          labels: data.map(item => item.label || item.name),
          datasets: [{
            data: data.map(item => item.value || item.count),
            backgroundColor: [
              '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'
            ]
          }]
        };
      case 'pie':
      case 'doughnut':
        return {
          labels: data.map(item => item.label || item.name),
          datasets: [{
            data: data.map(item => item.value || item.count),
            backgroundColor: [
              '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1',
              '#17a2b8', '#fd7e14', '#e83e8c', '#6c757d', '#20c997'
            ]
          }]
        };
      default:
        return data;
    }
  }

  // Date Range Helpers
  getDateRange(period: 'week' | 'month' | 'quarter' | 'year'): { start_date: string; end_date: string } {
    const now = new Date();
    const end_date = now.toISOString().split('T')[0];
    let start_date: string;

    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        start_date = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        start_date = monthAgo.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        start_date = quarterAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        start_date = yearAgo.toISOString().split('T')[0];
        break;
      default:
        start_date = end_date;
    }

    return { start_date, end_date };
  }

  // State Management
  getCurrentDashboardStats(): DashboardStats | null {
    return this.dashboardStatsSubject.value;
  }

  refreshDashboardStats(): Observable<DashboardStats> {
    return this.getDashboardStats();
  }

  clearAnalyticsData(): void {
    this.dashboardStatsSubject.next(null);
  }
}