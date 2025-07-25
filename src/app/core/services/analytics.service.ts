// src/app/core/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { TaskStatsResponse } from '../models/task.model';
import { ProjectStats } from '../models/project.model';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  archivedProjects: number;
  totalUsers: number;
  activeUsers: number;
  tasksCompletedToday: number;
  tasksCreatedToday: number;
  upcomingDeadlines: number;
  averageTaskCompletionTime: number;
  productivityScore: number;
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  tasksByStatus: {
    todo: number;
    in_progress: number;
    done: number;
    cancelled: number;
  };
  projectsByStatus: {
    active: number;
    completed: number;
    archived: number;
    on_hold: number;
  };
}

export interface UserPerformanceMetrics {
  userId: number;
  userName: string;
  userEmail: string;
  totalTasksAssigned: number;
  tasksCompleted: number;
  tasksInProgress: number;
  overdueTasks: number;
  averageCompletionTime: number;
  productivityScore: number;
  completionRate: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
  mostProductiveDay: string;
  preferredPriority: string;
  projectsContributed: number;
}

export interface ProjectAnalytics {
  projectId: number;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageTaskDuration: number;
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  budgetUtilization?: number;
  teamSize: number;
  mostActiveContributor: string;
  criticalPath: string[];
  riskScore: number;
  velocityTrend: number[];
  burndownData: Array<{
    date: string;
    planned: number;
    actual: number;
  }>;
}

export interface TimeTrackingAnalytics {
  totalHoursLogged: number;
  averageHoursPerTask: number;
  hoursLoggedToday: number;
  hoursLoggedThisWeek: number;
  hoursLoggedThisMonth: number;
  mostProductiveHours: number[];
  timeByProject: Array<{
    projectId: number;
    projectName: string;
    hoursSpent: number;
    percentage: number;
  }>;
  timeByUser: Array<{
    userId: number;
    userName: string;
    hoursSpent: number;
    percentage: number;
  }>;
  overtimeHours: number;
  efficiencyScore: number;
}

export interface TrendAnalytics {
  period: 'week' | 'month' | 'quarter' | 'year';
  tasksCreated: Array<{ date: string; count: number }>;
  tasksCompleted: Array<{ date: string; count: number }>;
  projectsCreated: Array<{ date: string; count: number }>;
  projectsCompleted: Array<{ date: string; count: number }>;
  userActivity: Array<{ date: string; activeUsers: number }>;
  productivityTrend: Array<{ date: string; score: number }>;
  workloadDistribution: Array<{ date: string; workload: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private dashboardMetricsSubject = new BehaviorSubject<DashboardMetrics | null>(null);
  public dashboardMetrics$ = this.dashboardMetricsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Dashboard Analytics
  getDashboardMetrics(): Observable<DashboardMetrics> {
    this.loadingSubject.next(true);
    
    return this.http.get<DashboardMetrics>(API_ENDPOINTS.ANALYTICS.DASHBOARD).pipe(
      tap(metrics => {
        this.dashboardMetricsSubject.next(metrics);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.errorHandler.handleError(error);
      })
    );
  }

  // Task Analytics
  getTaskStatistics(filters?: {
    projectId?: number;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }): Observable<TaskStatsResponse> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId.toString());
      if (filters.userId) params = params.set('userId', filters.userId.toString());
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<TaskStatsResponse>(API_ENDPOINTS.ANALYTICS.TASK_STATS, { params }).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Project Analytics
  getProjectAnalytics(projectId: number): Observable<ProjectAnalytics> {
    return this.http.get<ProjectAnalytics>(API_ENDPOINTS.ANALYTICS.PROJECT_STATS(projectId)).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  getAllProjectsAnalytics(): Observable<ProjectAnalytics[]> {
    return this.http.get<ProjectAnalytics[]>(`${API_ENDPOINTS.ANALYTICS.BASE}/projects`).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // User Performance Analytics
  getUserPerformanceMetrics(userId: number): Observable<UserPerformanceMetrics> {
    return this.http.get<UserPerformanceMetrics>(API_ENDPOINTS.ANALYTICS.USER_STATS(userId)).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  getAllUsersPerformance(): Observable<UserPerformanceMetrics[]> {
    return this.http.get<UserPerformanceMetrics[]>(`${API_ENDPOINTS.ANALYTICS.BASE}/users`).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Time Tracking Analytics
  getTimeTrackingAnalytics(filters?: {
    projectId?: number;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }): Observable<TimeTrackingAnalytics> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.projectId) params = params.set('projectId', filters.projectId.toString());
      if (filters.userId) params = params.set('userId', filters.userId.toString());
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<TimeTrackingAnalytics>(`${API_ENDPOINTS.ANALYTICS.BASE}/time-tracking`, { params }).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Trend Analytics
  getTrendAnalytics(period: 'week' | 'month' | 'quarter' | 'year'): Observable<TrendAnalytics> {
    const params = new HttpParams().set('period', period);
    
    return this.http.get<TrendAnalytics>(`${API_ENDPOINTS.ANALYTICS.BASE}/trends`, { params }).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Workload Analytics
  getWorkloadAnalytics(filters?: {
    teamId?: number;
    departmentId?: number;
    startDate?: string;
    endDate?: string;
  }): Observable<{
    totalWorkload: number;
    averageWorkload: number;
    workloadByUser: Array<{
      userId: number;
      userName: string;
      currentWorkload: number;
      capacity: number;
      utilizationRate: number;
    }>;
    workloadDistribution: Array<{
      range: string;
      userCount: number;
      percentage: number;
    }>;
    recommendedRebalancing: Array<{
      fromUserId: number;
      toUserId: number;
      taskIds: number[];
      reason: string;
    }>;
  }> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.teamId) params = params.set('teamId', filters.teamId.toString());
      if (filters.departmentId) params = params.set('departmentId', filters.departmentId.toString());
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<any>(`${API_ENDPOINTS.ANALYTICS.BASE}/workload`, { params }).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Productivity Analytics
  getProductivityAnalytics(filters?: {
    userId?: number;
    projectId?: number;
    period?: 'day' | 'week' | 'month' | 'quarter';
  }): Observable<{
    productivityScore: number;
    productivityTrend: Array<{ date: string; score: number }>;
    factorsAnalysis: {
      taskComplexity: number;
      workloadBalance: number;
      deadlinePressure: number;
      collaborationEfficiency: number;
    };
    recommendations: string[];
    benchmarkComparison: {
      teamAverage: number;
      departmentAverage: number;
      companyAverage: number;
    };
  }> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.userId) params = params.set('userId', filters.userId.toString());
      if (filters.projectId) params = params.set('projectId', filters.projectId.toString());
      if (filters.period) params = params.set('period', filters.period);
    }

    return this.http.get<any>(`${API_ENDPOINTS.ANALYTICS.BASE}/productivity`, { params }).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Risk Analytics
  getRiskAnalytics(): Observable<{
    overallRiskScore: number;
    riskCategories: Array<{
      category: string;
      score: number;
      impact: 'low' | 'medium' | 'high' | 'critical';
      description: string;
    }>;
    projectRisks: Array<{
      projectId: number;
      projectName: string;
      riskScore: number;
      riskFactors: string[];
    }>;
    userRisks: Array<{
      userId: number;
      userName: string;
      riskScore: number;
      riskFactors: string[];
    }>;
    recommendations: Array<{
      priority: 'low' | 'medium' | 'high' | 'critical';
      action: string;
      description: string;
      estimatedImpact: string;
    }>;
  }> {
    return this.http.get<any>(`${API_ENDPOINTS.ANALYTICS.BASE}/risk`).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Custom Reports
  generateCustomReport(reportConfig: {
    name: string;
    type: 'task' | 'project' | 'user' | 'time' | 'productivity';
    filters: any;
    groupBy?: string[];
    metrics: string[];
    dateRange: {
      startDate: string;
      endDate: string;
    };
    format: 'json' | 'csv' | 'pdf';
  }): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.ANALYTICS.BASE}/custom-report`, reportConfig).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Export Analytics Data
  exportAnalyticsData(exportConfig: {
    type: 'dashboard' | 'tasks' | 'projects' | 'users' | 'time-tracking';
    format: 'csv' | 'excel' | 'pdf';
    filters?: any;
    dateRange?: {
      startDate: string;
      endDate: string;
    };
  }): Observable<Blob> {
    return this.http.post(`${API_ENDPOINTS.ANALYTICS.BASE}/export`, exportConfig, {
      responseType: 'blob'
    }).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Real-time Analytics Updates
  subscribeToRealTimeUpdates(): Observable<Partial<DashboardMetrics>> {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll simulate with periodic polling
    return new Observable(observer => {
      const interval = setInterval(() => {
        this.getDashboardMetrics().subscribe(
          metrics => observer.next(metrics),
          error => observer.error(error)
        );
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    });
  }

  // Utility Methods
  calculateCompletionRate(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  calculateProductivityScore(metrics: {
    tasksCompleted: number;
    averageCompletionTime: number;
    qualityScore?: number;
  }): number {
    // Simple productivity calculation - can be enhanced
    const baseScore = metrics.tasksCompleted * 10;
    const timeBonus = Math.max(0, 100 - metrics.averageCompletionTime);
    const qualityBonus = (metrics.qualityScore || 80) * 0.5;
    
    return Math.min(100, Math.round(baseScore + timeBonus + qualityBonus));
  }

  formatDuration(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${Math.round(hours)}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return `${days}d ${remainingHours}h`;
    }
  }

  getDateRange(period: 'week' | 'month' | 'quarter' | 'year'): {
    startDate: string;
    endDate: string;
  } {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  // Cache Management
  clearAnalyticsCache(): void {
    this.dashboardMetricsSubject.next(null);
  }

  refreshDashboard(): Observable<DashboardMetrics> {
    this.clearAnalyticsCache();
    return this.getDashboardMetrics();
  }
}