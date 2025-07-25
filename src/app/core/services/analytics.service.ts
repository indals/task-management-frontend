import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { API_ENDPOINTS } from '../constants/api.constants';
import { 
  TaskCompletionAnalytics,
  UserProductivityAnalytics,
  TaskStatusDistribution,
  TaskPriorityDistribution,
  AnalyticsFilters,
  TeamPerformanceMetrics,
  ProjectAnalytics,
  ApiResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Task Analytics
  getTaskCompletionAnalytics(filters?: AnalyticsFilters): Observable<TaskCompletionAnalytics> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<TaskCompletionAnalytics>>(API_ENDPOINTS.ANALYTICS.TASK_COMPLETION, { params })
      .pipe(
        map(response => response.data!),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  getUserProductivityAnalytics(filters?: AnalyticsFilters): Observable<UserProductivityAnalytics[]> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<UserProductivityAnalytics[]>>(API_ENDPOINTS.ANALYTICS.USER_PRODUCTIVITY, { params })
      .pipe(
        map(response => response.data!),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  getTaskStatusDistribution(filters?: AnalyticsFilters): Observable<TaskStatusDistribution[]> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<TaskStatusDistribution[]>>(API_ENDPOINTS.ANALYTICS.STATUS_DISTRIBUTION, { params })
      .pipe(
        map(response => response.data!),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  getTaskPriorityDistribution(filters?: AnalyticsFilters): Observable<TaskPriorityDistribution[]> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<TaskPriorityDistribution[]>>(API_ENDPOINTS.ANALYTICS.PRIORITY_DISTRIBUTION, { params })
      .pipe(
        map(response => response.data!),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // Team Analytics
  getTeamPerformanceMetrics(filters?: AnalyticsFilters): Observable<TeamPerformanceMetrics> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<TeamPerformanceMetrics>>(`${API_ENDPOINTS.ANALYTICS.BASE}/team-performance`, { params })
      .pipe(
        map(response => response.data!),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // Project Analytics
  getProjectAnalytics(projectId?: number, filters?: AnalyticsFilters): Observable<ProjectAnalytics[]> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (projectId) {
      params = params.set('project_id', projectId.toString());
    }
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<ProjectAnalytics[]>>(`${API_ENDPOINTS.ANALYTICS.BASE}/project-analytics`, { params })
      .pipe(
        map(response => response.data!),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // User-specific Analytics
  getUserAnalytics(userId: number, filters?: AnalyticsFilters): Observable<UserProductivityAnalytics> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    params = params.set('user_id', userId.toString());
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<UserProductivityAnalytics>>(`${API_ENDPOINTS.ANALYTICS.USER_PRODUCTIVITY}/${userId}`, { params })
      .pipe(
        map(response => response.data!),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // Time-based Analytics
  getDailyAnalytics(filters?: AnalyticsFilters): Observable<any> {
    const dailyFilters = { ...filters, period: 'daily' as const };
    return this.getTaskCompletionAnalytics(dailyFilters);
  }

  getWeeklyAnalytics(filters?: AnalyticsFilters): Observable<any> {
    const weeklyFilters = { ...filters, period: 'weekly' as const };
    return this.getTaskCompletionAnalytics(weeklyFilters);
  }

  getMonthlyAnalytics(filters?: AnalyticsFilters): Observable<any> {
    const monthlyFilters = { ...filters, period: 'monthly' as const };
    return this.getTaskCompletionAnalytics(monthlyFilters);
  }

  getYearlyAnalytics(filters?: AnalyticsFilters): Observable<any> {
    const yearlyFilters = { ...filters, period: 'yearly' as const };
    return this.getTaskCompletionAnalytics(yearlyFilters);
  }

  // Sprint Analytics
  getSprintAnalytics(sprintId: number, filters?: AnalyticsFilters): Observable<any> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    params = params.set('sprint_id', sprintId.toString());
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<any>>(`${API_ENDPOINTS.ANALYTICS.BASE}/sprint-analytics`, { params })
      .pipe(
        map(response => response.data!),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // Dashboard Analytics (combines multiple metrics)
  getDashboardAnalytics(filters?: AnalyticsFilters): Observable<any> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<any>>(`${API_ENDPOINTS.ANALYTICS.BASE}/dashboard`, { params })
      .pipe(
        map(response => response.data!),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // Comparison Analytics
  getComparisonAnalytics(filters?: AnalyticsFilters): Observable<any> {
    this.loadingSubject.next(true);
    
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<any>>(`${API_ENDPOINTS.ANALYTICS.BASE}/comparison`, { params })
      .pipe(
        map(response => response.data!),
        tap(() => this.loadingSubject.next(false)),
        catchError(this.handleError.bind(this))
      );
  }

  // Export Analytics
  exportAnalytics(type: string, filters?: AnalyticsFilters): Observable<Blob> {
    let params = new HttpParams();
    params = params.set('type', type);
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${API_ENDPOINTS.ANALYTICS.BASE}/export`, { 
      params, 
      responseType: 'blob' 
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Utility methods for date ranges
  getLastWeekFilters(): AnalyticsFilters {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  }

  getLastMonthFilters(): AnalyticsFilters {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  }

  getLastQuarterFilters(): AnalyticsFilters {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 3);
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  }

  getLastYearFilters(): AnalyticsFilters {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.loadingSubject.next(false);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors && error.error.errors.length > 0) {
        errorMessage = error.error.errors[0];
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Analytics Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}