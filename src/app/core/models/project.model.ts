import { User } from "./user.model";
import { Task } from "./task.model";

export interface Project {
  id: number;
  title: string;
  name?: string; // Alternative field name for compatibility
  description: string;
  created_at: string;
  updated_at: string;
  start_date?: string;
  end_date?: string;
  status: ProjectStatus;
  created_by: User;
  owner?: User; // Alternative field name
  members?: User[];
  contributors?: User[]; // Project contributors
  tasks?: Task[];
  task_count?: number;
  completed_task_count?: number;
  progress_percentage?: number;
  budget?: number;
  tags?: string[];
  is_public?: boolean;
  archived_at?: string;
  // Legacy properties for backward compatibility
  createdAt?: Date;
  updatedAt?: Date;
  ownerId?: string;
}

export interface CreateProjectRequest {
  title: string;
  name?: string;
  description: string;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
  budget?: number;
  tags?: string[];
  is_public?: boolean;
  contributors?: string[]; // Array of usernames or emails
}

export interface UpdateProjectRequest {
  title?: string;
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
  budget?: number;
  tags?: string[];
  is_public?: boolean;
}

export interface ProjectContributor {
  id: number;
  username: string;
  email: string;
  realName?: string;
  role?: ContributorRole;
  added_at: string;
  added_by: User;
}

export interface AddContributorRequest {
  username?: string;
  email?: string;
  role?: ContributorRole;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  created_by?: number;
  contributor?: string; // username
  search?: string;
  tags?: string[];
  start_date_from?: string;
  start_date_to?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'progress';
  sort_order?: 'asc' | 'desc';
}

export interface ProjectStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  archived_projects: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  projects_by_status: {
    active: number;
    completed: number;
    archived: number;
  };
}

// Enums for better type safety
export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  ON_HOLD = 'ON_HOLD'
}

export enum ContributorRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

// API Response interfaces
export interface ProjectApiResponse {
  success: boolean;
  data: Project | Project[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}