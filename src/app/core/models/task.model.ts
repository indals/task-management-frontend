// src/app/core/models/task.model.ts
import { User } from "./user.model";
import { Comment } from "./comment.model";
import { Project } from "./project.model";

export interface Task {
  id: number;
  title: string;
  name?: string; // Alternative field name for compatibility
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: User | null;
  assignee?: User | null; // camelCase alias
  assignees?: User[]; // Multiple assignees support
  created_by: User;
  project?: Project;
  project_id?: number;
  due_date: string | null;
  dueDate?: string | null; // camelCase alias
  created_at: string;
  createdAt?: string; // camelCase alias
  updated_at: string;
  updatedAt?: string; // camelCase alias
  subtasks?: Array<Subtask>;
  comments?: Array<Comment>;
  attachments?: Array<TaskAttachment>;
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  completion_percentage?: number;
  is_recurring?: boolean;
  parent_task_id?: number;
  order_index?: number;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  taskId?: number;
  task_id?: number;
  created_at?: string;
  updated_at?: string;
  assigned_to?: User;
  due_date?: string;
}

export interface TaskAttachment {
  id: number;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  url: string;
  uploaded_by: User;
  uploaded_at: string;
}

export interface CreateTaskRequest {
  title: string;
  name?: string; // Alternative field name
  description: string;
  priority: TaskPriority;
  due_date?: string;
  assigneeId?: number;
  assignees?: number[]; // Multiple assignees
  project_id?: number;
  tags?: string[];
  estimated_hours?: number;
  subtasks?: Omit<Subtask, 'id' | 'taskId' | 'task_id'>[];
  parent_task_id?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  name?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  assigned_to?: number;
  assignees?: number[];
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
  completion_percentage?: number;
  subtasks?: Array<Subtask>;
}

export interface BulkTaskRequest {
  tasks: CreateTaskRequest[];
}

export interface BulkDeleteRequest {
  taskIds: number[];
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: number;
  created_by?: number;
  project_id?: number;
  due_date_from?: string;
  due_date_to?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'due_date' | 'priority' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface TaskAssignRequest {
  user_id?: number;
  username?: string;
  email?: string;
}

export interface TaskStatusUpdate {
  status: TaskStatus;
  comment?: string;
}

// Enums for better type safety
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
  // Legacy support
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// API Response interfaces
export interface TaskApiResponse {
  success: boolean;
  data: Task | Task[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskStatsResponse {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  tasks_by_priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  tasks_by_status: {
    todo: number;
    in_progress: number;
    done: number;
    cancelled: number;
  };
}