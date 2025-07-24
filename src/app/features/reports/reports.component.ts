// src/app/features/reports/reports.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { Task } from '../../core/models/task.model';

interface ReportData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageCompletionTime: number;
}

interface ProjectReport {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  status: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <div class="reports-header">
        <h1>Reports & Analytics</h1>
        <div class="filter-controls">
          <select [(ngModel)]="selectedPeriod" (change)="onPeriodChange()" class="period-selector">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button class="export-btn" (click)="exportReport()">
            <i class="fa fa-download"></i> Export
          </button>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="overview-cards">
        <div class="report-card">
          <div class="card-icon total">
            <i class="fa fa-tasks"></i>
          </div>
          <div class="card-content">
            <h3>{{ reportData.totalTasks }}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div class="report-card">
          <div class="card-icon completed">
            <i class="fa fa-check-circle"></i>
          </div>
          <div class="card-content">
            <h3>{{ reportData.completedTasks }}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div class="report-card">
          <div class="card-icon pending">
            <i class="fa fa-clock"></i>
          </div>
          <div class="card-content">
            <h3>{{ reportData.pendingTasks }}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div class="report-card">
          <div class="card-icon overdue">
            <i class="fa fa-exclamation-triangle"></i>
          </div>
          <div class="card-content">
            <h3>{{ reportData.overdueTasks }}</h3>
            <p>Overdue</p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-section">
        <div class="chart-container">
          <h3>Task Completion Rate</h3>
          <div class="completion-chart">
            <div class="progress-circle">
              <div class="progress-text">
                <span class="percentage">{{ reportData.completionRate }}%</span>
                <span class="label">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <h3>Task Status Distribution</h3>
          <div class="status-chart">
            <div class="chart-bar">
              <div class="bar completed" [style.width.%]="getPercentage('completed')">
                <span class="bar-label">Completed ({{ reportData.completedTasks }})</span>
              </div>
            </div>
            <div class="chart-bar">
              <div class="bar pending" [style.width.%]="getPercentage('pending')">
                <span class="bar-label">Pending ({{ reportData.pendingTasks }})</span>
              </div>
            </div>
            <div class="chart-bar">
              <div class="bar overdue" [style.width.%]="getPercentage('overdue')">
                <span class="bar-label">Overdue ({{ reportData.overdueTasks }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Reports -->
      <div class="project-reports">
        <h3>Project Performance</h3>
        <div class="projects-table">
          <div class="table-header">
            <div>Project Name</div>
            <div>Total Tasks</div>
            <div>Completed</div>
            <div>Completion Rate</div>
            <div>Status</div>
          </div>
          
          <div class="table-row" *ngFor="let project of projectReports">
            <div class="project-name">{{ project.name }}</div>
            <div class="task-count">{{ project.totalTasks }}</div>
            <div class="completed-count">{{ project.completedTasks }}</div>
            <div class="completion-rate">
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="project.completionRate"></div>
              </div>
              <span>{{ project.completionRate }}%</span>
            </div>
            <div class="project-status">
              <span class="status-badge" [class]="'status-' + project.status.toLowerCase()">
                {{ project.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="performance-metrics">
        <h3>Performance Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-item">
            <div class="metric-value">{{ reportData.averageCompletionTime }}</div>
            <div class="metric-label">Avg. Completion Time (days)</div>
          </div>
          
          <div class="metric-item">
            <div class="metric-value">{{ getTasksPerDay() }}</div>
            <div class="metric-label">Tasks per Day</div>
          </div>
          
          <div class="metric-item">
            <div class="metric-value">{{ getProductivityScore() }}%</div>
            <div class="metric-label">Productivity Score</div>
          </div>
          
          <div class="metric-item">
            <div class="metric-value">{{ getTeamEfficiency() }}%</div>
            <div class="metric-label">Team Efficiency</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading">
        <div class="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>

      <!-- No Data State -->
      <div class="no-data-container" *ngIf="!loading && reportData.totalTasks === 0">
        <i class="fa fa-chart-bar"></i>
        <h3>No data available</h3>
        <p>Start creating tasks to see reports and analytics</p>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .reports-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .reports-header h1 {
      margin: 0;
      color: #333;
      font-size: 28px;
      font-weight: 600;
    }

    .filter-controls {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .period-selector {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      font-size: 14px;
    }

    .export-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }

    .export-btn:hover {
      background: #0056b3;
    }

    .overview-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .report-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .card-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
    }

    .card-icon.total { background: #007bff; }
    .card-icon.completed { background: #28a745; }
    .card-icon.pending { background: #ffc107; }
    .card-icon.overdue { background: #dc3545; }

    .card-content h3 {
      margin: 0 0 5px 0;
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }

    .card-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-container {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .chart-container h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
    }

    .completion-chart {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }

    .progress-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: conic-gradient(#28a745 0deg 216deg, #f8f9fa 216deg 360deg);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .progress-circle::after {
      content: '';
      width: 100px;
      height: 100px;
      background: white;
      border-radius: 50%;
      position: absolute;
    }

    .progress-text {
      position: relative;
      z-index: 1;
      text-align: center;
    }

    .percentage {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }

    .label {
      font-size: 12px;
      color: #666;
    }

    .status-chart {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .chart-bar {
      position: relative;
      background: #f8f9fa;
      border-radius: 6px;
      height: 40px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      display: flex;
      align-items: center;
      padding: 0 15px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      transition: width 0.3s ease;
    }

    .bar.completed { background: #28a745; }
    .bar.pending { background: #ffc107; }
    .bar.overdue { background: #dc3545; }

    .project-reports {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .project-reports h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
    }

    .projects-table {
      display: grid;
      gap: 10px;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 2fr 1fr;
      gap: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 2fr 1fr;
      gap: 15px;
      padding: 15px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      align-items: center;
    }

    .progress-bar {
      background: #f8f9fa;
      border-radius: 10px;
      height: 8px;
      margin-right: 10px;
      overflow: hidden;
      flex: 1;
    }

    .progress-fill {
      background: #28a745;
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .completion-rate {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-completed {
      background: #cce5ff;
      color: #004085;
    }

    .status-on-hold {
      background: #fff3cd;
      color: #856404;
    }

    .performance-metrics {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .performance-metrics h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metric-item {
      text-align: center;
      padding: 20px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
    }

    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #007bff;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 14px;
      color: #666;
    }

    .loading-container, .no-data-container {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-data-container i {
      font-size: 48px;
      color: #ddd;
      margin-bottom: 20px;
    }

    .no-data-container h3 {
      margin: 0 0 10px 0;
      color: #666;
    }

    .no-data-container p {
      margin: 0;
      color: #999;
    }

    @media (max-width: 768px) {
      .reports-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .overview-cards {
        grid-template-columns: 1fr;
      }

      .charts-section {
        grid-template-columns: 1fr;
      }

      .table-header, .table-row {
        grid-template-columns: 1fr;
        gap: 5px;
      }

      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  selectedPeriod = 'month';
  loading = false;
  
  reportData: ReportData = {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0
  };
  
  projectReports: ProjectReport[] = [];
  tasks: Task[] = [];

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.loadReportData();
  }

  loadReportData() {
    this.loading = true;
    
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.calculateReportData();
        this.loadProjectReports();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  calculateReportData() {
    const now = new Date();
    const filteredTasks = this.filterTasksByPeriod(this.tasks, this.selectedPeriod);
    
    this.reportData.totalTasks = filteredTasks.length;
    this.reportData.completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED').length;
    this.reportData.pendingTasks = filteredTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
    this.reportData.overdueTasks = filteredTasks.filter(t => {
      return t.due_date && new Date(t.due_date) < now && t.status !== 'COMPLETED';
    }).length;
    
    this.reportData.completionRate = this.reportData.totalTasks > 0 
      ? Math.round((this.reportData.completedTasks / this.reportData.totalTasks) * 100)
      : 0;
      
    // Calculate average completion time
    const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED');
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        if (task.created_at && task.updated_at) {
          const created = new Date(task.created_at);
          const completed = new Date(task.updated_at);
          const days = Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }
        return sum;
      }, 0);
      this.reportData.averageCompletionTime = Math.round(totalDays / completedTasks.length);
    }
  }

  loadProjectReports() {
    // Mock project reports for now
    this.projectReports = [
      {
        id: '1',
        name: 'Website Redesign',
        totalTasks: 12,
        completedTasks: 8,
        completionRate: 67,
        status: 'ACTIVE'
      },
      {
        id: '2',
        name: 'Mobile App',
        totalTasks: 15,
        completedTasks: 15,
        completionRate: 100,
        status: 'COMPLETED'
      },
      {
        id: '3',
        name: 'Marketing Campaign',
        totalTasks: 8,
        completedTasks: 3,
        completionRate: 38,
        status: 'ON_HOLD'
      }
    ];
  }

  filterTasksByPeriod(tasks: Task[], period: string): Task[] {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return tasks.filter(task => {
      const taskDate = new Date(task.created_at);
      return taskDate >= startDate;
    });
  }

  onPeriodChange() {
    this.loadReportData();
  }

  getPercentage(type: string): number {
    if (this.reportData.totalTasks === 0) return 0;
    
    switch (type) {
      case 'completed':
        return (this.reportData.completedTasks / this.reportData.totalTasks) * 100;
      case 'pending':
        return (this.reportData.pendingTasks / this.reportData.totalTasks) * 100;
      case 'overdue':
        return (this.reportData.overdueTasks / this.reportData.totalTasks) * 100;
      default:
        return 0;
    }
  }

  getTasksPerDay(): number {
    const daysInPeriod = this.getDaysInPeriod();
    return daysInPeriod > 0 ? Math.round(this.reportData.totalTasks / daysInPeriod * 10) / 10 : 0;
  }

  getProductivityScore(): number {
    return Math.min(this.reportData.completionRate + 10, 100);
  }

  getTeamEfficiency(): number {
    const onTimeRate = this.reportData.totalTasks > 0 
      ? ((this.reportData.totalTasks - this.reportData.overdueTasks) / this.reportData.totalTasks) * 100
      : 100;
    return Math.round(onTimeRate);
  }

  private getDaysInPeriod(): number {
    switch (this.selectedPeriod) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  }

  exportReport() {
    // Implement export functionality
    console.log('Exporting report...');
    // You can implement CSV, PDF export here
  }
}