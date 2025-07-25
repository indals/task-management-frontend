export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_LEAD' | 'SENIOR_DEVELOPER' | 'DEVELOPER' | 'QA_ENGINEER' | 'DEVOPS_ENGINEER' | 'UI_UX_DESIGNER' | 'BUSINESS_ANALYST' | 'PRODUCT_OWNER' | 'SCRUM_MASTER';
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  github_username?: string;
  linkedin_url?: string;
  phone?: string;
  timezone: string;
  daily_work_hours: number;
  hourly_rate?: number;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  github_username?: string;
  linkedin_url?: string;
  phone?: string;
  timezone: string;
  daily_work_hours: number;
  hourly_rate?: number;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  github_username?: string;
  linkedin_url?: string;
  phone?: string;
  timezone?: string;
  daily_work_hours?: number;
  hourly_rate?: number;
  is_active?: boolean;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}