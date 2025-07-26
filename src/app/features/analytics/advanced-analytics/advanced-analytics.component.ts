// src/app/features/analytics/advanced-analytics/advanced-analytics.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';

// Register Chart.js components
Chart.register(...registerables);

export interface AnalyticsData {
  taskCompletion: any;
  userProductivity: any;
  statusDistribution: any;
  priorityDistribution: any;
  timeTracking: any;
  projectProgress: any;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  tasksCompleted: number;
  averageCompletionTime: number;
  productivity: number;
  currentTasks: number;
}

export interface ProjectSummary {
  id: number;
  name: string;
  progress: number;
  tasksCount: number;
  completedTasks: number;
  overdueTasks: number;
  teamSize: number;
  status: string;
}

@Component({
  selector: 'app-advanced-analytics',
  templateUrl: './advanced-analytics.component.html',
  styleUrls: ['./advanced-analytics.component.scss']
})
export class AdvancedAnalyticsComponent implements OnInit, OnDestroy {
  @ViewChild('burndownChart', { static: true }) burndownChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('velocityChart', { static: true }) velocityChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('workloadChart', { static: true }) workloadChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart', { static: true }) trendChartRef!: ElementRef<HTMLCanvasElement>;

  private destroy$ = new Subject<void>();
  private charts: Chart[] = [];

  // Data
  analyticsData: AnalyticsData | null = null;
  teamMembers: TeamMember[] = [];
  projectSummaries: ProjectSummary[] = [];
  
  // UI State
  isLoading = false;
  errorMessage: string | null = null;
  activeTab: 'overview' | 'productivity' | 'projects' | 'trends' = 'overview';
  selectedTimeframe = '30d';
  selectedProject = 'all';
  selectedTeamMember = 'all';

  // Forms
  filtersForm: FormGroup;

  // Filter Options
  timeframeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '3m', label: 'Last 3 months' },
    { value: '6m', label: 'Last 6 months' },
    { value: '1y', label: 'Last year' }
  ];

  projects: any[] = [];
  users: any[] = [];

  // Summary Stats
  summaryStats = {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    averageCompletionTime: 0,
    teamProductivity: 0,
    projectsOnTrack: 0,
    upcomingDeadlines: 0
  };

  constructor(
    private fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.filtersForm = this.fb.group({
      timeframe: [this.selectedTimeframe],
      project: [this.selectedProject],
      teamMember: [this.selectedTeamMember]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private setupFormSubscriptions(): void {
    this.filtersForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(values => {
      this.selectedTimeframe = values.timeframe;
      this.selectedProject = values.project;
      this.selectedTeamMember = values.teamMember;
      this.loadAnalyticsData();
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    forkJoin({
      projects: this.projectService.getProjects(),
      users: this.authService.getUsers()
    }).subscribe({
      next: (data) => {
        this.projects = (data.projects as unknown as any).results;
        this.users = data.users;
        this.loadAnalyticsData();
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  private loadAnalyticsData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      taskCompletion: this.analyticsService.getTaskCompletionRate(this.selectedTimeframe),
      userProductivity: this.analyticsService.getUserProductivity(),
      statusDistribution: this.analyticsService.getTaskStatusDistribution(),
      priorityDistribution: this.analyticsService.getTaskPriorityDistribution()
    }).subscribe({
      next: (data) => {
        this.analyticsData = data as any;
        this.processSummaryStats();
        this.generateTeamMemberData();
        this.generateProjectSummaries();
        this.createCharts();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  private processSummaryStats(): void {
    if (!this.analyticsData) return;

    const { taskCompletion, statusDistribution, userProductivity } = this.analyticsData;

    this.summaryStats = {
      totalTasks: taskCompletion?.total_tasks || 0,
      completedTasks: taskCompletion?.completed_tasks || 0,
      inProgressTasks: taskCompletion?.in_progress_tasks || 0,
      overdueTasks: userProductivity?.overdue_tasks || 0,
      averageCompletionTime: userProductivity?.average_completion_time_days || 0,
      teamProductivity: this.calculateTeamProductivity(),
      projectsOnTrack: this.calculateProjectsOnTrack(),
      upcomingDeadlines: this.calculateUpcomingDeadlines()
    };
  }

  private generateTeamMemberData(): void {
    // Mock team member data - in real app, get from API
    this.teamMembers = this.users.map((user, index) => ({
      id: user.id,
      name: user.name,
      role: user.role || 'Developer',
      tasksCompleted: Math.floor(Math.random() * 20) + 5,
      averageCompletionTime: Math.floor(Math.random() * 5) + 1,
      productivity: Math.floor(Math.random() * 30) + 70,
      currentTasks: Math.floor(Math.random() * 8) + 2
    }));
  }

  private generateProjectSummaries(): void {
    // Mock project summaries - in real app, get from API
    this.projectSummaries = this.projects.map(project => ({
      id: project.id,
      name: project.name,
      progress: Math.floor(Math.random() * 100),
      tasksCount: Math.floor(Math.random() * 50) + 10,
      completedTasks: Math.floor(Math.random() * 30) + 5,
      overdueTasks: Math.floor(Math.random() * 5),
      teamSize: Math.floor(Math.random() * 8) + 3,
      status: project.status
    }));
  }

  private createCharts(): void {
    this.destroyCharts();
    
    setTimeout(() => {
      this.createBurndownChart();
      this.createVelocityChart();
      this.createWorkloadChart();
      this.createTrendChart();
    }, 0);
  }

  private createBurndownChart(): void {
    const ctx = this.burndownChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Mock burndown data
    const days = Array.from({length: 14}, (_, i) => `Day ${i + 1}`);
    const idealBurndown = days.map((_, i) => 100 - (i * 7.14));
    const actualBurndown = [100, 95, 88, 82, 75, 70, 62, 58, 48, 42, 35, 28, 20, 12];

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Ideal Burndown',
            data: idealBurndown,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderDash: [5, 5],
            tension: 0
          },
          {
            label: 'Actual Burndown',
            data: actualBurndown,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Sprint Burndown'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Story Points'
            }
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  private createVelocityChart(): void {
    const ctx = this.velocityChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Mock velocity data
    const sprints = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5'];
    const committedPoints = [25, 28, 30, 26, 32];
    const completedPoints = [23, 28, 27, 24, 30];

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: sprints,
        datasets: [
          {
            label: 'Committed',
            data: committedPoints,
            backgroundColor: 'rgba(156, 163, 175, 0.8)',
            borderColor: '#9ca3af',
            borderWidth: 1
          },
          {
            label: 'Completed',
            data: completedPoints,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: '#3b82f6',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Sprint Velocity'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Story Points'
            }
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  private createWorkloadChart(): void {
    const ctx = this.workloadChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Mock workload data
    const teamMembers = this.teamMembers.slice(0, 6).map(member => member.name);
    const workloadData = teamMembers.map(() => Math.floor(Math.random() * 40) + 20);

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: teamMembers,
        datasets: [{
          data: workloadData,
          backgroundColor: [
            '#ef4444',
            '#f97316',
            '#eab308',
            '#22c55e',
            '#06b6d4',
            '#8b5cf6'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          title: {
            display: true,
            text: 'Team Workload Distribution'
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  private createTrendChart(): void {
    const ctx = this.trendChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Mock trend data
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
    const completedTasks = [12, 18, 15, 22, 25, 20];
    const createdTasks = [15, 20, 18, 25, 23, 22];

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: weeks,
        datasets: [
          {
            label: 'Tasks Completed',
            data: completedTasks,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          },
          {
            label: 'Tasks Created',
            data: createdTasks,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Task Creation vs Completion Trend'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Tasks'
            }
          }
        }
      }
    };

    this.charts.push(new Chart(ctx, config));
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  // Tab Management
  setActiveTab(tab: 'overview' | 'productivity' | 'projects' | 'trends'): void {
    this.activeTab = tab;
    
    // Recreate charts when switching tabs to ensure proper rendering
    if (tab !== 'overview') {
      setTimeout(() => this.createCharts(), 100);
    }
  }

  // Export Functions
  exportReport(format: 'pdf' | 'excel' | 'csv'): void {
    // Mock export function - implement actual export logic
    console.log(`Exporting report as ${format}`);
    
    // In a real implementation, you would:
    // 1. Gather all current data
    // 2. Format it according to the selected format
    // 3. Generate and download the file
    
    const data = {
      summaryStats: this.summaryStats,
      teamMembers: this.teamMembers,
      projectSummaries: this.projectSummaries,
      timeframe: this.selectedTimeframe,
      generatedAt: new Date().toISOString()
    };
    
    switch (format) {
      case 'pdf':
        this.generatePDFReport(data);
        break;
      case 'excel':
        this.generateExcelReport(data);
        break;
      case 'csv':
        this.generateCSVReport(data);
        break;
    }
  }

  private generatePDFReport(data: any): void {
    // Mock PDF generation
    console.log('Generating PDF report with data:', data);
    // Use libraries like jsPDF or pdfmake
  }

  private generateExcelReport(data: any): void {
    // Mock Excel generation
    console.log('Generating Excel report with data:', data);
    // Use libraries like xlsx or exceljs
  }

  private generateCSVReport(data: any): void {
    // Mock CSV generation
    console.log('Generating CSV report with data:', data);
    // Convert data to CSV format and download
  }

  // Helper Methods
  private calculateTeamProductivity(): number {
    if (this.teamMembers.length === 0) return 0;
    const totalProductivity = this.teamMembers.reduce((sum, member) => sum + member.productivity, 0);
    return Math.round(totalProductivity / this.teamMembers.length);
  }

  private calculateProjectsOnTrack(): number {
    return this.projectSummaries.filter(project => 
      project.progress >= 75 && project.overdueTasks < 3
    ).length;
  }

  private calculateUpcomingDeadlines(): number {
    // Mock calculation - in real app, check actual deadlines
    return Math.floor(Math.random() * 10) + 5;
  }

  getProductivityColor(productivity: number): string {
    if (productivity >= 90) return '#10b981'; // green
    if (productivity >= 75) return '#3b82f6'; // blue
    if (productivity >= 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  }

  getProjectStatusColor(status: string): string {
    const colors: {[key: string]: string} = {
      'ACTIVE': '#10b981',
      'PLANNING': '#6b7280',
      'ON_HOLD': '#f59e0b',
      'COMPLETED': '#3b82f6',
      'CANCELLED': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  refreshData(): void {
    this.loadAnalyticsData();
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred while loading analytics data';
  }
}