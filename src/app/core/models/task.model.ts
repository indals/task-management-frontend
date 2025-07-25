// src/app/core/models/task.model.ts
import { User } from "./user.model";
import { Comment } from "./comment.model";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: User | null;
  assignee?: User | null; // alias for backward compatibility
  created_by: User;
  project_id?: number;
  category_id?: number;
  due_date: string | null;
  dueDate?: string | null; // alias for backward compatibility
  start_date?: string | null;
  completed_date?: string | null;
  estimated_hours?: number;
  actual_hours?: number;
  progress?: number; // 0-100 percentage
  tags?: string[];
  created_at: string;
  createdAt?: string; // alias for backward compatibility
  updated_at: string;
  updatedAt?: string; // alias for backward compatibility
  subtasks: Subtask[];
  comments?: Comment[];
  attachments?: TaskAttachment[];
  dependencies?: TaskDependency[];
  watchers?: User[];
  is_archived?: boolean;
  is_template?: boolean;
  template_id?: number;
}

export interface Subtask {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  taskId: number;
  assignee_id?: number;
  assignee?: User;
  due_date?: string;
  created_at: string;
  updated_at: string;
  order?: number;
}

export interface TaskAttachment {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  url: string;
  uploaded_by: User;
  uploaded_at: string;
  task_id: number;
}

export interface TaskDependency {
  id: number;
  task_id: number;
  depends_on_task_id: number;
  dependency_type: 'BLOCKS' | 'BLOCKED_BY' | 'RELATES_TO';
  created_at: string;
  depends_on_task?: Task;
}

export interface TaskActivity {
  id: number;
  task_id: number;
  user: User;
  action: TaskActivityAction;
  description: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  due_date?: string;
  start_date?: string;
  assignee_id?: number;
  project_id?: number;
  category_id?: number;
  estimated_hours?: number;
  tags?: string[];
  subtasks?: CreateSubtaskRequest[];
  template_id?: number;
}

export interface CreateSubtaskRequest {
  title: string;
  description?: string;
  assignee_id?: number;
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
  assignee_id?: number; // alias
  project_id?: number;
  category_id?: number;
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  progress?: number;
  tags?: string[];
  is_archived?: boolean;
}

export interface UpdateSubtaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  assignee_id?: number;
  due_date?: string;
  order?: number;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee_id?: number[];
  created_by_id?: number[];
  project_id?: number[];
  category_id?: number[];
  due_date_from?: string;
  due_date_to?: string;
  created_date_from?: string;
  created_date_to?: string;
  tags?: string[];
  search?: string;
  is_archived?: boolean;
  is_overdue?: boolean;
  has_no_assignee?: boolean;
  page?: number;
  limit?: number;
  sort_by?: TaskSortField;
  sort_order?: 'ASC' | 'DESC';
}

export interface BulkTaskUpdate {
  task_ids: number[];
  updates: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: number;
    project_id?: number;
    category_id?: number;
    due_date?: string;
    tags?: string[];
    is_archived?: boolean;
  };
}

export interface TaskStats {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  tasks_by_status: Record<TaskStatus, number>;
  tasks_by_priority: Record<TaskPriority, number>;
  completion_rate: number;
  average_completion_time: number;
}

// Enums and Types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskActivityAction = 
  | 'CREATED'
  | 'UPDATED'
  | 'STATUS_CHANGED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'COMMENTED'
  | 'ATTACHMENT_ADDED'
  | 'ATTACHMENT_REMOVED'
  | 'SUBTASK_ADDED'
  | 'SUBTASK_COMPLETED'
  | 'DUE_DATE_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'ARCHIVED'
  | 'RESTORED';

export type TaskSortField = 
  | 'title'
  | 'status'
  | 'priority'
  | 'due_date'
  | 'created_at'
  | 'updated_at'
  | 'assignee'
  | 'progress';

// Task template for creating recurring tasks
export interface TaskTemplate {
  id: number;
  name: string;
  title: string;
  description: string;
  priority: TaskPriority;
  estimated_hours?: number;
  tags?: string[];
  subtasks?: CreateSubtaskRequest[];
  created_by: User;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}