import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest, interval } from 'rxjs';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';

import { 
  DashboardService, 
  DashboardOverview, 
  RecentActivity, 
  UpcomingDeadline,
  ChartData as DashboardChartData,
  ProductivityMetrics,
  DashboardFilters
} from '../../core/services/dashboard.service';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { APP_CONFIG } from '../../core/constants/api.constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Chart references
  @ViewChild('taskCompletionChart', { static: false }) taskCompletionChart!: ElementRef;
  @ViewChild('taskDistributionChart', { static: false }) taskDistributionChart!: ElementRef;
  @ViewChild('projectProgressChart', { static: false }) projectProgressChart!: ElementRef;
  @ViewChild('productivityChart', { static: false }) productivityChart!: ElementRef;

  // Data properties
  overview: DashboardOverview | null = null;
  recentActivities: RecentActivity[] = [];
  upcomingDeadlines: UpcomingDeadline[] = [];
  chartData: DashboardChartData | null = null;
  productivityMetrics: ProductivityMetrics | null = null;

  // Chart instances
  private charts: { [key: string]: Chart } = {};

  // UI state
  isLoading = true;
  isRefreshing = false;
  errorMessage: string | null = null;
  selectedTimeRange = '30d';
  
  // Filter state
  filters: DashboardFilters = {};
  showFilters = false;

  // Configuration
  timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  // Quick stats
  quickStats = {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    activeProjects: 0,
    teamMembers: 0
  };

  // Widget visibility
  widgetVisibility = {
    overview: true,
    charts: true,
    recentActivities: true,
    upcomingDeadlines: true,
    productivity: true,
    quickActions: true
  };

  constructor(
    private dashboardService: DashboardService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupRealTimeUpdates();
    this.subscribeToDataUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const filters = this.buildFilters();

    combineLatest([
      this.dashboardService.getDashboardOverview(filters),
      this.dashboardService.getChartData(undefined, filters),
      this.dashboardService.getProductivityMetrics(undefined, filters),
      this.dashboardService.getUpcomingDeadlines(7)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([overview, chartData, productivity, deadlines]) => {
        this.overview = overview;
        this.chartData = chartData;
        this.productivityMetrics = productivity;
        this.upcomingDeadlines = deadlines;
        this.recentActivities = overview.recent_activities;
        
        this.updateQuickStats();
        this.initializeCharts();
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Failed to load dashboard data', error);
        this.isLoading = false;
      }
    });
  }

  private setupRealTimeUpdates(): void {
    // Update every 5 minutes
    interval(5 * 60 * 1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.refreshDashboard(false);
    });
  }

  private subscribeToDataUpdates(): void {
    // Subscribe to real-time updates from services
    this.dashboardService.overview$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(overview => {
      if (overview) {
        this.overview = overview;
        this.updateQuickStats();
      }
    });

    this.dashboardService.chartData$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(chartData => {
      if (chartData) {
        this.chartData = chartData;
        this.updateCharts();
      }
    });

    this.dashboardService.recentActivities$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(activities => {
      this.recentActivities = activities;
    });
  }

  private buildFilters(): DashboardFilters {
    const filters: DashboardFilters = { ...this.filters };
    
    // Add time range to filters
    const endDate = new Date();
    const startDate = new Date();
    
    switch (this.selectedTimeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    filters.date_range = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };

    return filters;
  }

  private updateQuickStats(): void {
    if (this.overview) {
      this.quickStats = {
        totalTasks: this.overview.user_stats.total_tasks,
        completedTasks: this.overview.user_stats.completed_tasks,
        inProgressTasks: this.overview.user_stats.in_progress_tasks,
        overdueTasks: this.overview.user_stats.overdue_tasks,
        completionRate: this.overview.user_stats.completion_rate,
        activeProjects: this.overview.project_stats.active_projects,
        teamMembers: this.overview.team_stats.total_team_members
      };
    }
  }

  private initializeCharts(): void {
    setTimeout(() => {
      this.createTaskCompletionChart();
      this.createTaskDistributionChart();
      this.createProjectProgressChart();
      this.createProductivityChart();
    }, 100);
  }

  private createTaskCompletionChart(): void {
    if (!this.taskCompletionChart?.nativeElement || !this.chartData) return;

    const ctx = this.taskCompletionChart.nativeElement.getContext('2d');
    
    const config: ChartConfiguration = {
      type: 'line',
      data: this.chartData.task_completion_trend,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Task Completion Trend'
          },
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Tasks'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    };

    this.charts['taskCompletion'] = new Chart(ctx, config);
  }

  private createTaskDistributionChart(): void {
    if (!this.taskDistributionChart?.nativeElement || !this.chartData) return;

    const ctx = this.taskDistributionChart.nativeElement.getContext('2d');
    
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: this.chartData.task_distribution,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Task Distribution by Status'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    };

    this.charts['taskDistribution'] = new Chart(ctx, config);
  }

  private createProjectProgressChart(): void {
    if (!this.projectProgressChart?.nativeElement || !this.chartData) return;

    const ctx = this.projectProgressChart.nativeElement.getContext('2d');
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: this.chartData.project_progress,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Project Progress'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Progress (%)'
            }
          }
        }
      }
    };

    this.charts['projectProgress'] = new Chart(ctx, config);
  }

  private createProductivityChart(): void {
    if (!this.productivityChart?.nativeElement || !this.chartData) return;

    const ctx = this.productivityChart.nativeElement.getContext('2d');
    
    const config: ChartConfiguration = {
      type: 'line',
      data: this.chartData.user_productivity,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'User Productivity'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Productivity Score'
            }
          }
        }
      }
    };

    this.charts['productivity'] = new Chart(ctx, config);
  }

  private updateCharts(): void {
    if (this.chartData) {
      Object.keys(this.charts).forEach(chartKey => {
        const chart = this.charts[chartKey];
        if (chart) {
          // Update chart data based on the chart type
          switch (chartKey) {
            case 'taskCompletion':
              chart.data = this.chartData!.task_completion_trend;
              break;
            case 'taskDistribution':
              chart.data = this.chartData!.task_distribution;
              break;
            case 'projectProgress':
              chart.data = this.chartData!.project_progress;
              break;
            case 'productivity':
              chart.data = this.chartData!.user_productivity;
              break;
          }
          chart.update();
        }
      });
    }
  }

  private destroyCharts(): void {
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    this.charts = {};
  }

  // Event handlers
  onTimeRangeChange(range: string): void {
    this.selectedTimeRange = range;
    this.loadDashboardData();
  }

  onFilterChange(): void {
    this.loadDashboardData();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filters = {};
    this.loadDashboardData();
  }

  refreshDashboard(showLoading = true): void {
    if (showLoading) {
      this.isRefreshing = true;
    }

    const filters = this.buildFilters();

    this.dashboardService.refreshDashboard(filters).subscribe({
      next: () => {
        this.notificationService.showSuccess('Dashboard refreshed successfully');
        this.isRefreshing = false;
      },
      error: (error) => {
        this.handleError('Failed to refresh dashboard', error);
        this.isRefreshing = false;
      }
    });
  }

  toggleWidget(widget: keyof typeof this.widgetVisibility): void {
    this.widgetVisibility[widget] = !this.widgetVisibility[widget];
  }

  // Navigation methods
  navigateToTasks(status?: string): void {
    const queryParams = status ? { status } : {};
    this.router.navigate(['/tasks'], { queryParams });
  }

  navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }

  navigateToTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  navigateToProject(projectId: number): void {
    this.router.navigate(['/projects', projectId]);
  }

  // Quick actions
  createTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  createProject(): void {
    this.router.navigate(['/projects/new']);
  }

  viewReports(): void {
    this.router.navigate(['/reports']);
  }

  // Activity methods
  getActivityIcon(activity: RecentActivity): string {
    const iconMap = {
      'task_created': 'fas fa-plus',
      'task_completed': 'fas fa-check',
      'task_assigned': 'fas fa-user-plus',
      'project_created': 'fas fa-folder-plus',
      'comment_added': 'fas fa-comment'
    };
    return iconMap[activity.type] || 'fas fa-info';
  }

  getActivityColor(activity: RecentActivity): string {
    const colorMap = {
      'task_created': 'text-primary',
      'task_completed': 'text-success',
      'task_assigned': 'text-info',
      'project_created': 'text-warning',
      'comment_added': 'text-secondary'
    };
    return colorMap[activity.type] || 'text-dark';
  }

  // Deadline methods
  getDeadlineColor(deadline: UpcomingDeadline): string {
    if (deadline.is_overdue) return 'text-danger';
    if (deadline.days_remaining <= 1) return 'text-warning';
    if (deadline.days_remaining <= 3) return 'text-info';
    return 'text-success';
  }

  getDeadlineIcon(deadline: UpcomingDeadline): string {
    if (deadline.is_overdue) return 'fas fa-exclamation-triangle';
    if (deadline.days_remaining <= 1) return 'fas fa-clock';
    return 'fas fa-calendar-alt';
  }

  // Export functionality
  exportDashboard(format: 'pdf' | 'excel' = 'pdf'): void {
    const filters = this.buildFilters();
    
    this.dashboardService.exportDashboardData(format, filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-report.${format}`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.notificationService.showSuccess('Dashboard exported successfully');
      },
      error: (error) => {
        this.handleError('Failed to export dashboard', error);
      }
    });
  }

  // Utility methods
  getProgressBarColor(percentage: number): string {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-info';
    if (percentage >= 40) return 'bg-warning';
    return 'bg-danger';
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = message;
    this.notificationService.showError(message);
  }
}