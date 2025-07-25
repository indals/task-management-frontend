
// src/app/core/models/analytics.model.ts
import { ApiResponse } from '../interfaces/api.interfaces';
import { TaskStatus, TaskPriority, TaskType } from './task.model';

export interface TaskCompletionAnalytics {
  user?: {
    id: number;
    name: string;
  };
  period: 'week' | 'month' | 'year';
  completion_rate: number;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  average_completion_time: number;
  productivity_trend: 'increasing' | 'decreasing' | 'stable';
  daily_breakdown: Array<{
    date: string;
    completed: number;
    created: number;
  }>;
}

export interface UserProductivityAnalytics {
  user: {
    id: number;
    name: string;
    role: string;
  };
  performance_metrics: {
    total_tasks_completed: number;
    average_task_completion_time: number;
    on_time_completion_rate: number;
    total_hours_logged: number;
    average_daily_hours: number;
    efficiency_score: number;
  };
  monthly_stats: {
    tasks_completed: number;
    hours_worked: number;
    projects_contributed: number;
    comments_made: number;
  };
  task_type_breakdown: Record<TaskType, number>;
  priority_handling: Record<TaskPriority, number>;
}

export interface TaskStatusDistribution {
  total_tasks: number;
  status_distribution: Record<TaskStatus, {
    count: number;
    percentage: number;
  }>;
  completion_rate: number;
  active_tasks: number;
}

export interface TaskPriorityDistribution {
  total_tasks: number;
  priority_distribution: Record<TaskPriority, {
    count: number;
    percentage: number;
    avg_completion_time: number;
  }>;
  high_priority_completion_rate: number;
  overdue_by_priority: Record<TaskPriority, number>;
}

export interface ProjectAnalytics {
  project_id: number;
  project_name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  average_task_duration: number;
  team_productivity: number;
  sprint_velocity: number;
  burndown_data: Array<{
    date: string;
    remaining_tasks: number;
    completed_tasks: number;
  }>;
  member_contributions: Array<{
    user_id: number;
    name: string;
    tasks_completed: number;
    hours_logged: number;
    contribution_percentage: number;
  }>;
}

export interface TeamPerformanceAnalytics {
  team_id: number;
  team_name: string;
  total_members: number;
  active_members: number;
  team_velocity: number;
  average_task_completion_time: number;
  collaboration_score: number;
  member_performance: Array<{
    user_id: number;
    name: string;
    role: string;
    productivity_score: number;
    tasks_completed: number;
    hours_logged: number;
    collaboration_rating: number;
  }>;
  project_distribution: Array<{
    project_id: number;
    project_name: string;
    tasks_count: number;
    completion_rate: number;
  }>;
}

export interface DashboardStats {
  overview: {
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
    active_projects: number;
    team_members: number;
    completion_rate: number;
  };
  recent_activities: Array<{
    id: number;
    type: 'task_created' | 'task_completed' | 'comment_added' | 'project_updated';
    description: string;
    user: {
      id: number;
      name: string;
    };
    timestamp: string;
  }>;
  task_distribution: {
    by_status: Record<TaskStatus, number>;
    by_priority: Record<TaskPriority, number>;
    by_type: Record<TaskType, number>;
  };
  productivity_trends: Array<{
    date: string;
    tasks_completed: number;
    hours_logged: number;
    team_velocity: number;
  }>;
}

export interface TimeTrackingAnalytics {
  user_id?: number;
  project_id?: number;
  period: 'week' | 'month' | 'quarter' | 'year';
  total_hours: number;
  billable_hours: number;
  efficiency_rate: number;
  daily_breakdown: Array<{
    date: string;
    hours: number;
    tasks_worked: number;
  }>;
  project_breakdown: Array<{
    project_id: number;
    project_name: string;
    hours: number;
    percentage: number;
  }>;
  task_type_breakdown: Record<TaskType, {
    hours: number;
    percentage: number;
    avg_hours_per_task: number;
  }>;
}

// Request Interfaces
export interface AnalyticsFilters {
  user_id?: number;
  project_id?: number;
  team_id?: number;
  period?: 'week' | 'month' | 'quarter' | 'year';
  start_date?: string;
  end_date?: string;
  include_archived?: boolean;
}

export interface ReportGenerationRequest {
  type: ReportType;
  filters: AnalyticsFilters;
  format: 'json' | 'csv' | 'pdf';
  include_charts?: boolean;
}

// Enums and Types
export type ReportType = 
  | 'task_completion'
  | 'user_productivity'
  | 'team_performance'
  | 'project_analytics'
  | 'time_tracking'
  | 'sprint_velocity'
  | 'burndown_chart';

export type AnalyticsMetric = 
  | 'completion_rate'
  | 'productivity_score'
  | 'team_velocity'
  | 'hours_logged'
  | 'task_count'
  | 'efficiency_rate';

// Response Types
export type TaskCompletionAnalyticsResponse = ApiResponse<TaskCompletionAnalytics>;
export type UserProductivityAnalyticsResponse = ApiResponse<UserProductivityAnalytics>;
export type TaskStatusDistributionResponse = ApiResponse<TaskStatusDistribution>;
export type TaskPriorityDistributionResponse = ApiResponse<TaskPriorityDistribution>;
export type ProjectAnalyticsResponse = ApiResponse<ProjectAnalytics>;
export type TeamPerformanceAnalyticsResponse = ApiResponse<TeamPerformanceAnalytics>;
export type DashboardStatsResponse = ApiResponse<DashboardStats>;
export type TimeTrackingAnalyticsResponse = ApiResponse<TimeTrackingAnalytics>;

// Chart Configuration
export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors: string[];
  responsive: boolean;
  legend: boolean;
}

export const ANALYTICS_CHART_CONFIGS: Record<string, ChartConfig> = {
  taskCompletion: {
    type: 'line',
    title: 'Task Completion Trend',
    xAxisLabel: 'Date',
    yAxisLabel: 'Tasks Completed',
    colors: ['#007bff', '#28a745'],
    responsive: true,
    legend: true
  },
  statusDistribution: {
    type: 'doughnut',
    title: 'Task Status Distribution',
    colors: ['#007bff', '#ffc107', '#28a745', '#dc3545', '#6c757d'],
    responsive: true,
    legend: true
  },
  priorityDistribution: {
    type: 'bar',
    title: 'Task Priority Distribution',
    xAxisLabel: 'Priority',
    yAxisLabel: 'Number of Tasks',
    colors: ['#dc3545', '#fd7e14', '#ffc107', '#28a745'],
    responsive: true,
    legend: false
  },
  teamVelocity: {
    type: 'area',
    title: 'Team Velocity Over Time',
    xAxisLabel: 'Sprint',
    yAxisLabel: 'Story Points',
    colors: ['#007bff', '#17a2b8'],
    responsive: true,
    legend: true
  },
  burndownChart: {
    type: 'line',
    title: 'Sprint Burndown Chart',
    xAxisLabel: 'Days',
    yAxisLabel: 'Remaining Work',
    colors: ['#dc3545', '#6c757d'],
    responsive: true,
    legend: true
  }
};

// Helper Functions
export const calculateProductivityScore = (metrics: UserProductivityAnalytics['performance_metrics']): number => {
  const weights = {
    completion_rate: 0.3,
    efficiency: 0.25,
    on_time_rate: 0.25,
    hours_consistency: 0.2
  };
  
  const completionScore = Math.min(metrics.total_tasks_completed / 50, 1) * 100;
  const efficiencyScore = metrics.efficiency_score;
  const onTimeScore = metrics.on_time_completion_rate;
  const hoursScore = Math.min(metrics.average_daily_hours / 8, 1) * 100;
  
  return (
    completionScore * weights.completion_rate +
    efficiencyScore * weights.efficiency +
    onTimeScore * weights.on_time_rate +
    hoursScore * weights.hours_consistency
  );
};

export const formatAnalyticsNumber = (value: number, type: 'percentage' | 'hours' | 'count' | 'score'): string => {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'hours':
      return `${value.toFixed(1)}h`;
    case 'count':
      return value.toLocaleString();
    case 'score':
      return `${value.toFixed(0)}/100`;
    default:
      return value.toString();
  }
};

export const getAnalyticsTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  const threshold = 0.05; // 5% threshold for considering stable
  const change = (current - previous) / previous;
  
  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'up' : 'down';
};