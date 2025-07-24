// src/app/features/analytics/analytics.component.ts
import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  isLoading = true;
  currentUser: any;
  
  // Charts
  teamPerformanceChart: Chart | null = null;
  taskTrendsChart: Chart | null = null;
  projectProgressChart: Chart | null = null;
  workloadDistributionChart: Chart | null = null;
  
  // Data
  teamMetrics = {
    totalEmployees: 0,
    activeTasks: 0,
    completionRate: 0,
    avgTasksPerEmployee: 0
  };
  
  taskTrends: {
    labels: string[];
    completed: number[];
    created: number[];
  } = {
    labels: [],
    completed: [],
    created: []
  };
  
  topPerformers: any[] = [];
  projectsOverview: any[] = [];

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAnalyticsData();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private loadAnalyticsData(): void {
    this.isLoading = true;
    
    // Load all analytics data
    Promise.all([
      this.loadTeamMetrics(),
      this.loadTaskTrends(),
      this.loadTopPerformers(),
      this.loadProjectsOverview()
    ]).then(() => {
      this.initializeCharts();
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading analytics:', error);
      this.loadMockData();
      this.initializeCharts();
      this.isLoading = false;
    });
  }

  private loadTeamMetrics(): Promise<void> {
    return new Promise((resolve) => {
      // Mock data - replace with actual service call
      this.teamMetrics = {
        totalEmployees: 12,
        activeTasks: 47,
        completionRate: 84,
        avgTasksPerEmployee: 3.9
      };
      resolve();
    });
  }

  private loadTaskTrends(): Promise<void> {
    return new Promise((resolve) => {
      // Mock data - replace with actual service call
      const last7Days: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      
      this.taskTrends = {
        labels: last7Days,
        completed: [8, 12, 15, 10, 18, 14, 16],
        created: [10, 14, 12, 16, 15, 18, 12]
      };
      resolve();
    });
  }

  private loadTopPerformers(): Promise<void> {
    return new Promise((resolve) => {
      // Mock data - replace with actual service call
      this.topPerformers = [
        { name: 'Alice Johnson', tasksCompleted: 24, completionRate: 96 },
        { name: 'Bob Smith', tasksCompleted: 22, completionRate: 92 },
        { name: 'Carol Williams', tasksCompleted: 20, completionRate: 89 },
        { name: 'David Brown', tasksCompleted: 18, completionRate: 87 },
        { name: 'Emma Davis', tasksCompleted: 16, completionRate: 85 }
      ];
      resolve();
    });
  }

  private loadProjectsOverview(): Promise<void> {
    return new Promise((resolve) => {
      // Mock data - replace with actual service call
      this.projectsOverview = [
        { name: 'Website Redesign', progress: 85, status: 'On Track', dueDate: '2024-03-30' },
        { name: 'Mobile App', progress: 65, status: 'On Track', dueDate: '2024-04-15' },
        { name: 'Database Migration', progress: 25, status: 'Behind', dueDate: '2024-05-01' },
        { name: 'Security Audit', progress: 90, status: 'Ahead', dueDate: '2024-03-15' }
      ];
      resolve();
    });
  }

  private loadMockData(): void {
    // Fallback mock data
    this.teamMetrics = {
      totalEmployees: 12,
      activeTasks: 47,
      completionRate: 84,
      avgTasksPerEmployee: 3.9
    };
  }

  private initializeCharts(): void {
    setTimeout(() => {
      this.initTeamPerformanceChart();
      this.initTaskTrendsChart();
      this.initProjectProgressChart();
      this.initWorkloadDistributionChart();
    }, 100);
  }

  private initTeamPerformanceChart(): void {
    const ctx = document.getElementById('teamPerformanceChart') as HTMLCanvasElement;
    if (ctx) {
      this.teamPerformanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'In Progress', 'Pending'],
          datasets: [{
            data: [65, 25, 10],
            backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  private initTaskTrendsChart(): void {
    const ctx = document.getElementById('taskTrendsChart') as HTMLCanvasElement;
    if (ctx) {
      this.taskTrendsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.taskTrends.labels,
          datasets: [
            {
              label: 'Tasks Completed',
              data: this.taskTrends.completed,
              borderColor: '#4caf50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4
            },
            {
              label: 'Tasks Created',
              data: this.taskTrends.created,
              borderColor: '#2196f3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
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
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  private initProjectProgressChart(): void {
    const ctx = document.getElementById('projectProgressChart') as HTMLCanvasElement;
    if (ctx) {
      this.projectProgressChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.projectsOverview.map(p => p.name),
          datasets: [{
            label: 'Progress %',
            data: this.projectsOverview.map(p => p.progress),
            backgroundColor: this.projectsOverview.map(p => 
              p.status === 'Ahead' ? '#4caf50' : 
              p.status === 'Behind' ? '#f44336' : '#2196f3'
            ),
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }
  }

  private initWorkloadDistributionChart(): void {
    const ctx = document.getElementById('workloadDistributionChart') as HTMLCanvasElement;
    if (ctx) {
      this.workloadDistributionChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Frontend', 'Backend', 'Design', 'Testing', 'DevOps', 'Documentation'],
          datasets: [{
            label: 'Current Sprint',
            data: [85, 70, 60, 45, 55, 40],
            borderColor: '#2196f3',
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            pointBackgroundColor: '#2196f3'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    }
  }

  private destroyCharts(): void {
    [this.teamPerformanceChart, this.taskTrendsChart, this.projectProgressChart, this.workloadDistributionChart]
      .forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
  }

  exportReport(): void {
    // Implement report export functionality
    console.log('Exporting analytics report...');
  }

  refreshData(): void {
    this.loadAnalyticsData();
  }
}