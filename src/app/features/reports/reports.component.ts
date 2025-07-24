// src/app/features/reports/reports.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';

interface ReportData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  cancelledTasks: number;
  completionRate: number;
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  userPerformance: UserPerformance[];
  monthlyTrends: MonthlyTrend[];
  upcomingDeadlines: Task[];
}

interface UserPerformance {
  user: string;
  assigned: number;
  completed: number;
  completion_rate: number;
}

interface MonthlyTrend {
  month: string;
  created: number;
  completed: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reports-container">
      <!-- Reports Header -->
      <div class="reports-header">
        <h1>Reports & Analytics</h1>
        <div class="date-filter">
          <select [(ngModel)]="selectedPeriod" (change)="onPeriodChange()">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button class="export-btn" (click)="exportReport()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading report data...</p>
      </div>

      <!-- Report Content -->
      <div class="reports-content" *ngIf="!loading && reportData">
        
        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card total">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ reportData.totalTasks }}</h3>
              <p>Total Tasks</p>
            </div>
          </div>

          <div class="summary-card completed">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ reportData.completedTasks }}</h3>
              <p>Completed</p>
              <span class="percentage">{{ reportData.completionRate }}%</span>
            </div>
          </div>

          <div class="summary-card pending">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ reportData.pendingTasks }}</h3>
              <p>Pending</p>
            </div>
          </div>

          <div class="summary-card in-progress">
            <div class="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <div class="card-content">
              <h3>{{ reportData.inProgressTasks }}</h3>
              <p>In Progress</p>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <!-- Priority Distribution -->
          <div class="chart-card">
            <h3>Priority Distribution</h3>
            <div class="priority-chart">
              <div class="priority-item">
                <div class="priority-bar">
                  <div class="bar high" [style.width.%]="getPriorityPercentage('high')"></div>
                </div>
                <div class="priority-info">
                  <span class="priority-label high">High Priority</span>
                  <span class="priority-count">{{ reportData.priorityBreakdown.high }}</span>
                </div>
              </div>
              
              <div class="priority-item">
                <div class="priority-bar">
                  <div class="bar medium" [style.width.%]="getPriorityPercentage('medium')"></div>
                </div>
                <div class="priority-info">
                  <span class="priority-label medium">Medium Priority</span>
                  <span class="priority-count">{{ reportData.priorityBreakdown.medium }}</span>
                </div>
              </div>
              
              <div class="priority-item">
                <div class="priority-bar">
                  <div class="bar low" [style.width.%]="getPriorityPercentage('low')"></div>
                </div>
                <div class="priority-info">
                  <span class="priority-label low">Low Priority</span>
                  <span class="priority-count">{{ reportData.priorityBreakdown.low }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Distribution -->
          <div class="chart-card">
            <h3>Task Status Overview</h3>
            <div class="status-chart">
              <div class="donut-chart">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#e9ecef" stroke-width="20"></circle>
                  <circle 
                    cx="100" cy="100" r="80" fill="none" 
                    stroke="#28a745" stroke-width="20"
                    stroke-dasharray="{{ getCircumference() }}"
                    stroke-dashoffset="{{ getStrokeDashoffset('completed') }}"
                    transform="rotate(-90 100 100)"
                  ></circle>
                  <circle 
                    cx="100" cy="100" r="80" fill="none" 
                    stroke="#007bff" stroke-width="20"
                    stroke-dasharray="{{ getCircumference() }}"
                    stroke-dashoffset="{{ getStrokeDashoffset('in_progress') }}"
                    transform="rotate({{ getRotationAngle('completed') }} 100 100)"
                  ></circle>
                  <circle 
                    cx="100" cy="100" r="80" fill="none" 
                    stroke="#ffc107" stroke-width="20"
                    stroke-dasharray="{{ getCircumference() }}"
                    stroke-dashoffset="{{ getStrokeDashoffset('pending') }}"
                    transform="rotate({{ getRotationAngle('completed', 'in_progress') }} 100 100)"
                  ></circle>
                </svg>
                <div class="donut-center">
                  <div class="completion-rate">{{ reportData.completionRate }}%</div>
                  <div class="completion-label">Complete</div>
                </div>
              </div>
              
              <div class="status-legend">
                <div class="legend-item">
                  <div class="legend-color completed"></div>
                  <span>Completed ({{ reportData.completedTasks }})</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color in-progress"></div>
                  <span>In Progress ({{ reportData.inProgressTasks }})</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color pending"></div>
                  <span>Pending ({{ reportData.pendingTasks }})</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color cancelled"></div>
                  <span>Cancelled ({{ reportData.cancelledTasks }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Performance Table -->
        <div class="performance-section">
          <div class="section-header">
            <h3>Team Performance</h3>
            <div class="performance-filters">
              <select [(ngModel)]="performanceSort" (change)="sortUserPerformance()">
                <option value="completion_rate">Sort by Completion Rate</option>
                <option value="assigned">Sort by Tasks Assigned</option>
                <option value="completed">Sort by Tasks Completed</option>
              </select>
            </div>
          </div>
          
          <div class="performance-table">
            <div class="table-header">
              <div class="col-user">Team Member</div>
              <div class="col-assigned">Assigned</div>
              <div class="col-completed">Completed</div>
              <div class="col-rate">Completion Rate</div>
              <div class="col-progress">Progress</div>
            </div>
            
            <div class="table-row" *ngFor="let user of reportData.userPerformance">
              <div class="col-user">
                <div class="user-info">
                  <div class="user-avatar">{{ getUserInitials(user.user) }}</div>
                  <span class="user-name">{{ user.user }}</span>
                </div>
              </div>
              <div class="col-assigned">{{ user.assigned }}</div>
              <div class="col-completed">{{ user.completed }}</div>
              <div class="col-rate">{{ user.completion_rate }}%</div>
              <div class="col-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="user.completion_rate"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Trends -->
        <div class="trends-section">
          <h3>Monthly Trends</h3>
          <div class="trend-chart">
            <div class="trend-bars">
              <div class="trend-month" *ngFor="let trend of reportData.monthlyTrends">
                <div class="bars-container">
                  <div class="bar created" 
                       [style.height.px]="getTrendBarHeight(trend.created, 'created')"
                       [title]="'Created: ' + trend.created">
                  </div>
                  <div class="bar completed" 
                       [style.height.px]="getTrendBarHeight(trend.completed, 'completed')"
                       [title]="'Completed: ' + trend.completed">
                  </div>
                </div>
                <div class="month-label">{{ trend.month }}</div>
              </div>
            </div>
            
            <div class="trend-legend">
              <div class="legend-item">
                <div class="legend-color created"></div>
                <span>Tasks Created</span>
              </div>
              <div class="legend-item">
                <div class="legend-color completed"></div>
                <span>Tasks Completed</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Deadlines -->
        <div class="deadlines-section">
          <h3>Upcoming Deadlines</h3>
          <div class="deadlines-list" *ngIf="reportData.upcomingDeadlines.length > 0; else noDeadlines">
            <div class="deadline-item" *ngFor="let task of reportData.upcomingDeadlines">
              <div class="deadline-info">
                <h4>{{ task.title }}</h4>
                <p>{{ task.description }}</p>
                <div class="deadline-meta">
                  <span class="assignee">{{ task.assigned_to?.name || 'Unassigned' }}</span>
                  <span class="priority" [class]="'priority-' + task.priority.toLowerCase()">
                    {{ task.priority }}
                  </span>
                </div>
              </div>
              <div class="deadline-date">
                <div class="days-remaining" [class]="getDaysRemainingClass(task.due_date)">
                  {{ getDaysRemaining(task.due_date) }}
                </div>
                <div class="due-date">{{ task.due_date | date:'MMM dd' }}</div>
              </div>
            </div>
          </div>
          
          <ng-template #noDeadlines>
            <div class="no-deadlines">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              <p>No upcoming deadlines</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 20px;
      max-width: 1400px;
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
      font-weight: 700;
    }

    .date-filter {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .date-filter select {
      padding: 8px 16px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      background: white;
      font-size: 14px;
    }

    .export-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }

    .export-btn:hover {
      background: #0056b3;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #666;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }

    .card-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .summary-card.total .card-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .summary-card.completed .card-icon {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    }

    .summary-card.pending .card-icon {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
    }

    .summary-card.in-progress .card-icon {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    }

    .card-content h3 {
      margin: 0 0 4px 0;
      font-size: 32px;
      font-weight: 700;
      color: #333;
    }

    .card-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .percentage {
      display: block;
      color: #28a745;
      font-size: 12px;
      font-weight: 600;
      margin-top: 4px;
    }

    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .chart-card h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .priority-chart {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .priority-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .priority-bar {
      flex: 1;
      height: 24px;
      background: #f8f9fa;
      border-radius: 12px;
      overflow: hidden;
    }

    .bar {
      height: 100%;
      border-radius: 12px;
      transition: width 0.5s ease;
    }

    .bar.high {
      background: linear-gradient(90deg, #dc3545, #c82333);
    }

    .bar.medium {
      background: linear-gradient(90deg, #ffc107, #e0a800);
    }

    .bar.low {
      background: linear-gradient(90deg, #28a745, #218838);
    }

    .priority-info {
      display: flex;
      justify-content: space-between;
      min-width: 140px;
    }

    .priority-label {
      font-size: 14px;
      font-weight: 500;
    }

    .priority-label.high {
      color: #dc3545;
    }

    .priority-label.medium {
      color: #ffc107;
    }

    .priority-label.low {
      color: #28a745;
    }

    .priority-count {
      font-weight: 600;
      color: #333;
    }

    .status-chart {
      display: flex;
      align-items: center;
      gap: 30px;
    }

    .donut-chart {
      position: relative;
    }

    .donut-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .completion-rate {
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }

    .completion-label {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .status-legend {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }

    .legend-color.completed {
      background: #28a745;
    }

    .legend-color.in-progress {
      background: #007bff;
    }

    .legend-color.pending {
      background: #ffc107;
    }

    .legend-color.cancelled {
      background: #dc3545;
    }

    .legend-color.created {
      background: #6c757d;
    }

    .performance-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .performance-filters select {
      padding: 6px 12px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      background: white;
      font-size: 14px;
    }

    .performance-table {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
      background: #f8f9fa;
      padding: 16px;
      font-weight: 600;
      color: #666;
      font-size: 14px;
      border-bottom: 1px solid #dee2e6;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
      padding: 16px;
      border-bottom: 1px solid #f1f3f4;
      align-items: center;
      transition: background 0.2s;
    }

    .table-row:hover {
      background: #f8f9fa;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .user-name {
      font-weight: 500;
      color: #333;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #28a745, #20c997);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .trends-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .trends-section h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .trend-chart {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .trend-bars {
      display: flex;
      align-items: end;
      justify-content: space-between;
      height: 200px;
      padding: 0 20px;
      border-bottom: 1px solid #dee2e6;
    }

    .trend-month {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .bars-container {
      display: flex;
      align-items: end;
      gap: 4px;
      height: 160px;
    }

    .trend-bars .bar {
      width: 24px;
      border-radius: 4px 4px 0 0;
      transition: height 0.5s ease;
    }

    .trend-bars .bar.created {
      background: linear-gradient(to top, #6c757d, #495057);
    }

    .trend-bars .bar.completed {
      background: linear-gradient(to top, #28a745, #20c997);
    }

    .month-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .trend-legend {
      display: flex;
      justify-content: center;
      gap: 30px;
    }

    .deadlines-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .deadlines-section h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .deadlines-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .deadline-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .deadline-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-color: #007bff;
    }

    .deadline-info h4 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 16px;
      font-weight: 600;
    }

    .deadline-info p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .deadline-meta {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .assignee {
      font-size: 12px;
      color: #666;
      background: #f8f9fa;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .priority {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }

    .priority-high {
      background: #f8d7da;
      color: #721c24;
    }

    .priority-medium {
      background: #fff3cd;
      color: #856404;
    }

    .priority-low {
      background: #d4edda;
      color: #155724;
    }

    .deadline-date {
      text-align: center;
      min-width: 80px;
    }

    .days-remaining {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .days-remaining.overdue {
      color: #dc3545;
    }

    .days-remaining.urgent {
      color: #fd7e14;
    }

    .days-remaining.normal {
      color: #28a745;
    }

    .due-date {
      font-size: 12px;
      color: #666;
    }

    .no-deadlines {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #666;
      text-align: center;
    }

    .no-deadlines svg {
      margin-bottom: 16px;
      opacity: 0.5;
    }

    @media (max-width: 768px) {
      .reports-header {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
      }

      .date-filter {
        justify-content: space-between;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }

      .charts-row {
        grid-template-columns: 1fr;
      }

      .table-header,
      .table-row {
        grid-template-columns: 2fr 1fr 1fr;
      }

      .col-rate,
      .col-progress {
        display: none;
      }

      .trend-bars {
        overflow-x: auto;
        padding: 0 10px;
      }

      .deadline-item {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .deadline-date {
        text-align: left;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  reportData: ReportData | null = null;
  loading = true;
  selectedPeriod = 'month';
  performanceSort = 'completion_rate';
  
  tasks: Task[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadReportData();
  }

  loadReportData() {
    this.loading = true;
    
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.generateReportData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  generateReportData() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = this.tasks.filter(t => t.status === 'PENDING').length;
    const inProgressTasks = this.tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const cancelledTasks = this.tasks.filter(t => t.status === 'CANCELLED').length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Priority breakdown
    const priorityBreakdown = {
      high: this.tasks.filter(t => t.priority === 'HIGH').length,
      medium: this.tasks.filter(t => t.priority === 'MEDIUM').length,
      low: this.tasks.filter(t => t.priority === 'LOW').length
    };
    
    // User performance
    const userPerformance = this.calculateUserPerformance();
    
    // Monthly trends (simplified - you might want to use actual date ranges)
    const monthlyTrends = this.generateMonthlyTrends();
    
    // Upcoming deadlines
    const upcomingDeadlines = this.getUpcomingDeadlines();
    
    this.reportData = {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      cancelledTasks,
      completionRate,
      priorityBreakdown,
      userPerformance,
      monthlyTrends,
      upcomingDeadlines
    };
  }

  calculateUserPerformance(): UserPerformance[] {
    const userMap = new Map<string, { assigned: number; completed: number }>();
    
    this.tasks.forEach(task => {
      const userName = task.assigned_to?.name || 'Unassigned';
      
      if (!userMap.has(userName)) {
        userMap.set(userName, { assigned: 0, completed: 0 });
      }
      
      const userData = userMap.get(userName)!;
      userData.assigned++;
      
      if (task.status === 'COMPLETED') {
        userData.completed++;
      }
    });
    
    const performance: UserPerformance[] = [];
    userMap.forEach((data, user) => {
      const completion_rate = data.assigned > 0 ? Math.round((data.completed / data.assigned) * 100) : 0;
      performance.push({
        user,
        assigned: data.assigned,
        completed: data.completed,
        completion_rate
      });
    });
    
    return performance.filter(p => p.user !== 'Unassigned');
  }

  generateMonthlyTrends(): MonthlyTrend[] {
    // Simplified version - you might want to use actual date grouping
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      created: Math.floor(Math.random() * 20) + 5, // Mock data
      completed: Math.floor(Math.random() * 15) + 3 // Mock data
    }));
  }

  getUpcomingDeadlines(): Task[] {
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    
    return this.tasks
      .filter(task => {
        if (!task.due_date || task.status === 'COMPLETED' || task.status === 'CANCELLED') {
          return false;
        }
        const dueDate = new Date(task.due_date);
        return dueDate >= now && dueDate <= oneWeekFromNow;
      })
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5);
  }

  getPriorityPercentage(priority: 'high' | 'medium' | 'low'): number {
    if (!this.reportData) return 0;
    const total = this.reportData.totalTasks;
    if (total === 0) return 0;
    return (this.reportData.priorityBreakdown[priority] / total) * 100;
  }

  getCircumference(): number {
    return 2 * Math.PI * 80; // radius = 80
  }

  getStrokeDashoffset(status: string): number {
    if (!this.reportData) return this.getCircumference();
    const total = this.reportData.totalTasks;
    if (total === 0) return this.getCircumference();
    
    let count = 0;
    switch (status) {
      case 'completed':
        count = this.reportData.completedTasks;
        break;
      case 'in_progress':
        count = this.reportData.inProgressTasks;
        break;
      case 'pending':
        count = this.reportData.pendingTasks;
        break;
    }
    
    const percentage = count / total;
    return this.getCircumference() * (1 - percentage);
  }

  getRotationAngle(...statuses: string[]): number {
    if (!this.reportData) return -90;
    const total = this.reportData.totalTasks;
    if (total === 0) return -90;
    
    let count = 0;
    statuses.forEach(status => {
      switch (status) {
        case 'completed':
          count += this.reportData!.completedTasks;
          break;
        case 'in_progress':
          count += this.reportData!.inProgressTasks;
          break;
        case 'pending':
          count += this.reportData!.pendingTasks;
          break;
      }
    });
    
    const percentage = count / total;
    return -90 + (360 * percentage);
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  sortUserPerformance() {
    if (!this.reportData) return;
    
    this.reportData.userPerformance.sort((a, b) => {
      switch (this.performanceSort) {
        case 'completion_rate':
          return b.completion_rate - a.completion_rate;
        case 'assigned':
          return b.assigned - a.assigned;
        case 'completed':
          return b.completed - a.completed;
        default:
          return 0;
      }
    });
  }

  getTrendBarHeight(value: number, type: 'created' | 'completed'): number {
    if (!this.reportData) return 0;
    const maxValue = Math.max(...this.reportData.monthlyTrends.map(t => Math.max(t.created, t.completed)));
    return maxValue > 0 ? (value / maxValue) * 160 : 0;
  }

  getDaysRemaining(dueDate: string | null): string {
    if (!dueDate) return 'No due date';
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return '1 day left';
    } else {
      return `${diffDays} days left`;
    }
  }

  getDaysRemainingClass(dueDate: string | null): string {
    if (!dueDate) return 'normal';
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'overdue';
    } else if (diffDays <= 2) {
      return 'urgent';
    } else {
      return 'normal';
    }
  }

  onPeriodChange() {
    // Implement period filtering logic
    this.loadReportData();
  }

  exportReport() {
    if (!this.reportData) return;
    
    // Create CSV content
    const csvContent = this.generateCSVReport();
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSVReport(): string {
    if (!this.reportData) return '';
    
    const headers = [
      'Metric',
      'Value'
    ];
    
    const rows = [
      ['Total Tasks', this.reportData.totalTasks.toString()],
      ['Completed Tasks', this.reportData.completedTasks.toString()],
      ['Pending Tasks', this.reportData.pendingTasks.toString()],
      ['In Progress Tasks', this.reportData.inProgressTasks.toString()],
      ['Cancelled Tasks', this.reportData.cancelledTasks.toString()],
      ['Completion Rate', `${this.reportData.completionRate}%`],
      ['High Priority Tasks', this.reportData.priorityBreakdown.high.toString()],
      ['Medium Priority Tasks', this.reportData.priorityBreakdown.medium.toString()],
      ['Low Priority Tasks', this.reportData.priorityBreakdown.low.toString()]
    ];
    
    // Add user performance data
    rows.push(['', '']); // Empty row
    rows.push(['User Performance', '']);
    rows.push(['User', 'Assigned', 'Completed', 'Completion Rate']);
    
    this.reportData.userPerformance.forEach(user => {
      rows.push([user.user, user.assigned.toString(), user.completed.toString(), `${user.completion_rate}%`]);
    });
    
    // Convert to CSV format
    const csvRows = [headers.join(','), ...rows.map(row => row.join(','))];
    return csvRows.join('\n');
  }
}