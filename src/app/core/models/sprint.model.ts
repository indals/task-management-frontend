// src/app/core/models/sprint.model.ts
import { Task } from './task.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api.interfaces';

export interface Sprint {
  id: number;
  name: string;
  description?: string;
  status: SprintStatus;
  project_id: number;
  start_date: string;
  end_date: string;
  goal?: string;
  capacity_hours: number;
  velocity_points: number;
  
  // Relationships
  project?: {
    id: number;
    name: string;
  };
  tasks?: Task[];
  
  // Computed fields
  tasks_count: number;
  completed_tasks: number;
  remaining_points: number;
  completion_rate?: number;
  velocity_achieved?: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface SprintBurndownData {
  sprint: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    total_points: number;
  };
  burndown_data: Array<{
    date: string;
    remaining_points: number;
    ideal_remaining: number;
    completed_points: number;
  }>;
  completion_rate: number;
  velocity: number;
  days_remaining: number;
}

export interface SprintStats {
  total_sprints: number;
  active_sprints: number;
  completed_sprints: number;
  average_velocity: number;
  average_completion_rate: number;
  total_story_points: number;
  completed_story_points: number;
}

// Request/Response Interfaces
export interface CreateSprintRequest {
  name: string;
  description?: string;
  project_id: number;
  start_date: string;
  end_date: string;
  goal?: string;
  capacity_hours: number;
  velocity_points: number;
}

export interface UpdateSprintRequest {
  name?: string;
  description?: string;
  goal?: string;
  capacity_hours?: number;
  velocity_points?: number;
  start_date?: string;
  end_date?: string;
}

export interface SprintFilters {
  status?: SprintStatus[];
  project_id?: number[];
  start_date_from?: string;
  start_date_to?: string;
  search?: string;
  sort_by?: SprintSortField;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

// Enums and Types
export type SprintStatus = 
  | 'PLANNED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type SprintSortField = 
  | 'name'
  | 'status'
  | 'start_date'
  | 'end_date'
  | 'created_at'
  | 'velocity_points';

// Response Types
export type SprintResponse = ApiResponse<Sprint>;
export type SprintListResponse = PaginatedResponse<Sprint>;
export type SprintBurndownResponse = ApiResponse<SprintBurndownData>;
export type SprintStatsResponse = ApiResponse<SprintStats>;

// Sprint Status Configuration
export const SPRINT_STATUS_CONFIG = {
  PLANNED: { label: 'Planned', color: '#6c757d', icon: 'calendar' },
  ACTIVE: { label: 'Active', color: '#28a745', icon: 'play-circle' },
  COMPLETED: { label: 'Completed', color: '#007bff', icon: 'check-circle' },
  CANCELLED: { label: 'Cancelled', color: '#dc3545', icon: 'times-circle' }
};

// Sprint Duration Helpers
export const SPRINT_DURATION_OPTIONS = [
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '3 Weeks', days: 21 },
  { label: '4 Weeks', days: 28 }
];

// Sprint Velocity Calculation Helpers
export interface VelocityMetrics {
  planned_points: number;
  completed_points: number;
  velocity_percentage: number;
  days_elapsed: number;
  total_days: number;
  average_daily_velocity: number;
  projected_completion_date?: string;
}

export const calculateSprintVelocity = (sprint: Sprint): VelocityMetrics => {
  const now = new Date();
  const startDate = new Date(sprint.start_date);
  const endDate = new Date(sprint.end_date);
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  const completedPoints = sprint.velocity_points - sprint.remaining_points;
  const velocityPercentage = sprint.velocity_points > 0 ? (completedPoints / sprint.velocity_points) * 100 : 0;
  const averageDailyVelocity = daysElapsed > 0 ? completedPoints / daysElapsed : 0;
  
  let projectedCompletionDate: string | undefined;
  if (averageDailyVelocity > 0 && sprint.remaining_points > 0) {
    const remainingDays = Math.ceil(sprint.remaining_points / averageDailyVelocity);
    const projectedDate = new Date(now.getTime() + (remainingDays * 24 * 60 * 60 * 1000));
    projectedCompletionDate = projectedDate.toISOString().split('T')[0];
  }
  
  return {
    planned_points: sprint.velocity_points,
    completed_points: completedPoints,
    velocity_percentage: velocityPercentage,
    days_elapsed: daysElapsed,
    total_days: totalDays,
    average_daily_velocity: averageDailyVelocity,
    projected_completion_date: projectedCompletionDate
  };
};