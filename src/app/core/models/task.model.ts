// src/app/core/models/task.model.ts
import { User } from './user.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api.interfaces';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  project_id?: number;
  sprint_id?: number;
  assignee_id?: number;
  reporter_id: number;
  story_points?: number;
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  tags: string[];
  dependencies: number[];
  is_blocked: boolean;
  blocked_reason?: string;
  
  // Relationships
  assignee?: User;
  reporter?: User;
  project?: {
    id: number;
    name: string;
  };
  sprint?: {
    id: number;
    name: string;
  };
  
  // Metadata
  created_at: string;
  updated_at: string;
  
  // Computed fields
  comments_count?: number;
  attachments_count?: number;
  time_logged?: number;
  completion_percentage?: number;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  user: {
    id: number;
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TaskTimeLog {
  id: number;
  task_id: number;
  user_id: number;
  hours: number;
  description: string;
  work_date: string;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface TaskAttachment {
  id: number;
  task_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  uploaded_by: number;
  uploaded_at: string;
}

export interface TaskActivity {
  id: number;
  task_id: number;
  user_id: number;
  action: TaskActivityAction;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
}

// Request/Response Interfaces
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  project_id?: number;
  sprint_id?: number;
  assignee_id?: number;
  story_points?: number;
  estimated_hours?: number;
  start_date?: string;
  due_date?: string;
  tags?: string[];
  dependencies?: number[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignee_id?: number;
  story_points?: number;
  estimated_hours?: number;
  start_date?: string;
  due_date?: string;
  tags?: string[];
  dependencies?: number[];
  is_blocked?: boolean;
  blocked_reason?: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  type?: TaskType[];
  assignee_id?: number[];
  project_id?: number[];
  sprint_id?: number[];
  due_date_from?: string;
  due_date_to?: string;
  is_overdue?: boolean;
  has_dependencies?: boolean;
  is_blocked?: boolean;
  tags?: string[];
  search?: string;
  sort_by?: TaskSortField;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface BulkTaskUpdate {
  task_ids: number[];
  updates: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: number;
    sprint_id?: number;
    tags?: string[];
  };
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  blocked_tasks: number;
  completion_rate: number;
  average_completion_time: number;
  status_distribution: Record<TaskStatus, number>;
  priority_distribution: Record<TaskPriority, number>;
  type_distribution: Record<TaskType, number>;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CreateTimeLogRequest {
  hours: number;
  description: string;
  work_date: string;
}

export interface TaskAssignmentRequest {
  assignee_id: number;
}

export interface TaskStatusUpdateRequest {
  status: TaskStatus;
  comment?: string;
}

// Enums and Types
export type TaskStatus = 
  | 'BACKLOG'
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'TESTING'
  | 'BLOCKED'
  | 'DONE'
  | 'CANCELLED'
  | 'DEPLOYED';

export type TaskPriority = 
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type TaskType = 
  | 'FEATURE'
  | 'BUG'
  | 'ENHANCEMENT'
  | 'REFACTOR'
  | 'DOCUMENTATION'
  | 'TESTING'
  | 'DEPLOYMENT'
  | 'RESEARCH'
  | 'MAINTENANCE'
  | 'SECURITY';

export type TaskActivityAction = 
  | 'CREATED'
  | 'UPDATED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'COMMENTED'
  | 'BLOCKED'
  | 'UNBLOCKED'
  | 'DEPENDENCY_ADDED'
  | 'DEPENDENCY_REMOVED';

export type TaskSortField = 
  | 'title'
  | 'status'
  | 'priority'
  | 'due_date'
  | 'created_at'
  | 'updated_at'
  | 'story_points'
  | 'assignee';

// Response Types
export type TaskResponse = ApiResponse<Task>;
export type TaskListResponse = PaginatedResponse<Task>;
export type TaskStatsResponse = ApiResponse<TaskStats>;
export type TaskCommentsResponse = PaginatedResponse<TaskComment>;
export type TaskTimeLogsResponse = ApiResponse<{
  task: Task;
  time_logs: TaskTimeLog[];
  total_hours: number;
  contributors: Array<{
    user_id: number;
    name: string;
    hours: number;
  }>;
}>;
export type TaskActivitiesResponse = PaginatedResponse<TaskActivity>;

// Priority and Status Display Configurations
export const TASK_PRIORITY_CONFIG = {
  CRITICAL: { label: 'Critical', color: '#ff4757', icon: 'warning' },
  HIGH: { label: 'High', color: '#ff6b35', icon: 'arrow-up' },
  MEDIUM: { label: 'Medium', color: '#ffa502', icon: 'minus' },
  LOW: { label: 'Low', color: '#26de81', icon: 'arrow-down' }
};

export const TASK_STATUS_CONFIG = {
  BACKLOG: { label: 'Backlog', color: '#6c757d', icon: 'archive' },
  TODO: { label: 'To Do', color: '#007bff', icon: 'circle' },
  IN_PROGRESS: { label: 'In Progress', color: '#ffc107', icon: 'play-circle' },
  IN_REVIEW: { label: 'In Review', color: '#17a2b8', icon: 'eye' },
  TESTING: { label: 'Testing', color: '#fd7e14', icon: 'bug' },
  BLOCKED: { label: 'Blocked', color: '#dc3545', icon: 'ban' },
  DONE: { label: 'Done', color: '#28a745', icon: 'check-circle' },
  CANCELLED: { label: 'Cancelled', color: '#6c757d', icon: 'times-circle' },
  DEPLOYED: { label: 'Deployed', color: '#20c997', icon: 'rocket' }
};

export const TASK_TYPE_CONFIG = {
  FEATURE: { label: 'Feature', color: '#007bff', icon: 'star' },
  BUG: { label: 'Bug', color: '#dc3545', icon: 'bug' },
  ENHANCEMENT: { label: 'Enhancement', color: '#28a745', icon: 'plus-circle' },
  REFACTOR: { label: 'Refactor', color: '#6f42c1', icon: 'code' },
  DOCUMENTATION: { label: 'Documentation', color: '#17a2b8', icon: 'file-text' },
  TESTING: { label: 'Testing', color: '#fd7e14', icon: 'check-square' },
  DEPLOYMENT: { label: 'Deployment', color: '#20c997', icon: 'upload' },
  RESEARCH: { label: 'Research', color: '#e83e8c', icon: 'search' },
  MAINTENANCE: { label: 'Maintenance', color: '#6c757d', icon: 'wrench' },
  SECURITY: { label: 'Security', color: '#343a40', icon: 'shield' }
};