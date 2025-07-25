// src/app/core/models/team.model.ts
import { User } from './user.model';
import { Project } from './project.model';

export interface Team {
  id: number;
  name: string;
  description?: string;
  created_by: User;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
  projects?: Project[];
  is_active: boolean;
  member_count: number;
  project_count: number;
}

export interface TeamMember {
  id: number;
  user: User;
  team_id: number;
  role: TeamRole;
  joined_at: string;
  added_by: User;
  is_active: boolean;
  permissions?: TeamPermission[];
}

export interface TeamInvitation {
  id: number;
  team: Team;
  invited_user_email: string;
  invited_user?: User;
  invited_by: User;
  role: TeamRole;
  status: InvitationStatus;
  invitation_token: string;
  expires_at: string;
  created_at: string;
  responded_at?: string;
  message?: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  initial_members?: CreateTeamMemberRequest[];
}

export interface CreateTeamMemberRequest {
  user_id?: number;
  email?: string;
  role: TeamRole;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateTeamMemberRequest {
  role?: TeamRole;
  is_active?: boolean;
  permissions?: TeamPermission[];
}

export interface InviteTeamMemberRequest {
  email: string;
  role: TeamRole;
  message?: string;
}

export interface TeamStats {
  total_members: number;
  active_members: number;
  total_projects: number;
  active_projects: number;
  completed_tasks: number;
  pending_tasks: number;
  team_performance_score: number;
}

// Enums and Types
export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export type TeamPermission = 
  | 'CREATE_TASKS'
  | 'EDIT_TASKS'
  | 'DELETE_TASKS'
  | 'ASSIGN_TASKS'
  | 'CREATE_PROJECTS'
  | 'EDIT_PROJECTS'
  | 'DELETE_PROJECTS'
  | 'MANAGE_MEMBERS'
  | 'VIEW_REPORTS'
  | 'MANAGE_TEAM_SETTINGS';

export const TEAM_ROLE_PERMISSIONS: Record<TeamRole, TeamPermission[]> = {
  OWNER: [
    'CREATE_TASKS',
    'EDIT_TASKS',
    'DELETE_TASKS',
    'ASSIGN_TASKS',
    'CREATE_PROJECTS',
    'EDIT_PROJECTS',
    'DELETE_PROJECTS',
    'MANAGE_MEMBERS',
    'VIEW_REPORTS',
    'MANAGE_TEAM_SETTINGS'
  ],
  ADMIN: [
    'CREATE_TASKS',
    'EDIT_TASKS',
    'DELETE_TASKS',
    'ASSIGN_TASKS',
    'CREATE_PROJECTS',
    'EDIT_PROJECTS',
    'DELETE_PROJECTS',
    'MANAGE_MEMBERS',
    'VIEW_REPORTS'
  ],
  MEMBER: [
    'CREATE_TASKS',
    'EDIT_TASKS',
    'ASSIGN_TASKS',
    'VIEW_REPORTS'
  ],
  VIEWER: [
    'VIEW_REPORTS'
  ]
};