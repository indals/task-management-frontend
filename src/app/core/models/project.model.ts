import { User } from './user.model';

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  start_date?: string;
  end_date?: string;
  budget?: number;
  created_by: User;
  project_manager?: User;
  team_members: User[];
  created_at: string;
  updated_at: string;
  tasks_count: number;
  completed_tasks_count: number;
  sprints_count: number;
  active_sprints_count: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  project_manager_id?: number;
  team_member_ids?: number[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  project_manager_id?: number;
  team_member_ids?: number[];
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  joined_at: string;
  user: User;
}

export interface AddProjectMemberRequest {
  user_id: number;
  role?: string;
}