// src/app/core/constants/api.constants.ts
import { environment } from '../../../environments/environment';

const BASE_URL = environment?.apiUrl || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Authentication & User Management
  AUTH: {
    BASE: `${BASE_URL}/auth`,
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    REFRESH: `${BASE_URL}/auth/refresh-token`,
    PROFILE: `${BASE_URL}/auth/profile`,
    ME: `${BASE_URL}/auth/me`,
    CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
    USERS: `${BASE_URL}/users`,
    USER_BY_ID: (id: number) => `${BASE_URL}/users/${id}`,
    UPDATE_USER: (id: number) => `${BASE_URL}/users/${id}`,
    DELETE_USER: (id: number) => `${BASE_URL}/users/${id}`,
    PING: `${BASE_URL}/auth/ping`
  },

  // Enhanced Task Management
  TASKS: {
    BASE: `${BASE_URL}/tasks`,
    BY_ID: (id: number) => `${BASE_URL}/tasks/${id}`,
    COMMENTS: (taskId: number) => `${BASE_URL}/tasks/${taskId}/comments`,
    COMMENT_BY_ID: (taskId: number, commentId: number) => `${BASE_URL}/tasks/${taskId}/comments/${commentId}`,
    ASSIGN: (taskId: number) => `${BASE_URL}/tasks/${taskId}/assign`,
    UNASSIGN: (taskId: number) => `${BASE_URL}/tasks/${taskId}/unassign`,
    STATUS: (taskId: number) => `${BASE_URL}/tasks/${taskId}/status`,
    TIME_LOGS: (taskId: number) => `${BASE_URL}/tasks/${taskId}/time`,
    OVERDUE: `${BASE_URL}/tasks/overdue`,
    MY_TASKS: `${BASE_URL}/tasks/my-tasks`,
    BULK_UPDATE: `${BASE_URL}/tasks/bulk-update`,
    BULK_DELETE: `${BASE_URL}/tasks/bulk-delete`,
    SEARCH: `${BASE_URL}/tasks/search`,
    EXPORT: `${BASE_URL}/tasks/export`,
    STATS: `${BASE_URL}/tasks/stats`
  },

  // Sprint Management (Agile/Scrum)
  SPRINTS: {
    BASE: `${BASE_URL}/sprints`,
    BY_ID: (id: number) => `${BASE_URL}/sprints/${id}`,
    PROJECT_SPRINTS: (projectId: number) => `${BASE_URL}/sprints/project/${projectId}`,
    START: (sprintId: number) => `${BASE_URL}/sprints/${sprintId}/start`,
    COMPLETE: (sprintId: number) => `${BASE_URL}/sprints/${sprintId}/complete`,
    BURNDOWN: (sprintId: number) => `${BASE_URL}/sprints/${sprintId}/burndown`,
    ADD_TASK: (sprintId: number, taskId: number) => `${BASE_URL}/sprints/${sprintId}/tasks/${taskId}`,
    REMOVE_TASK: (sprintId: number, taskId: number) => `${BASE_URL}/sprints/${sprintId}/tasks/${taskId}`
  },

  // Project Management
  PROJECTS: {
    BASE: `${BASE_URL}/projects`,
    BY_ID: (id: number) => `${BASE_URL}/projects/${id}`,
    TASKS: (projectId: number) => `${BASE_URL}/projects/${projectId}/tasks`,
    MEMBERS: (projectId: number) => `${BASE_URL}/projects/${projectId}/members`,
    ADD_MEMBER: (projectId: number) => `${BASE_URL}/projects/${projectId}/members`,
    REMOVE_MEMBER: (projectId: number, userId: number) => `${BASE_URL}/projects/${projectId}/members/${userId}`,
    STATS: (projectId: number) => `${BASE_URL}/projects/${projectId}/stats`
  },

  // Team Management with Role-based Access
  TEAMS: {
    BASE: `${BASE_URL}/teams`,
    BY_ID: (id: number) => `${BASE_URL}/teams/${id}`,
    MEMBERS: (teamId: number) => `${BASE_URL}/teams/${teamId}/members`,
    ADD_MEMBER: (teamId: number) => `${BASE_URL}/teams/${teamId}/members`,
    REMOVE_MEMBER: (teamId: number, userId: number) => `${BASE_URL}/teams/${teamId}/members/${userId}`,
    INVITATIONS: `${BASE_URL}/teams/invitations`,
    INVITE_MEMBER: `${BASE_URL}/teams/invite`,
    ACCEPT_INVITATION: (invitationId: number) => `${BASE_URL}/teams/invitations/${invitationId}/accept`,
    DECLINE_INVITATION: (invitationId: number) => `${BASE_URL}/teams/invitations/${invitationId}/decline`,
    STATS: (teamId: number) => `${BASE_URL}/teams/${teamId}/stats`
  },

  // Real-time Notifications
  NOTIFICATIONS: {
    BASE: `${BASE_URL}/notifications`,
    BY_ID: (id: number) => `${BASE_URL}/notifications/${id}`,
    MARK_READ: (id: number) => `${BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${BASE_URL}/notifications/read-all`,
    UNREAD_COUNT: `${BASE_URL}/notifications/unread-count`
  },

  // Analytics & Reporting
  ANALYTICS: {
    BASE: `${BASE_URL}/analytics`,
    TASK_COMPLETION: `${BASE_URL}/analytics/task-completion`,
    USER_PRODUCTIVITY: `${BASE_URL}/analytics/user-productivity`,
    TASK_STATUS_DISTRIBUTION: `${BASE_URL}/analytics/task-status-distribution`,
    TASK_PRIORITY_DISTRIBUTION: `${BASE_URL}/analytics/task-priority-distribution`
  },

  // Dashboard
  DASHBOARD: {
    BASE: `${BASE_URL}/dashboard`,
    STATS: `${BASE_URL}/dashboard/stats`,
    RECENT_ACTIVITIES: `${BASE_URL}/dashboard/recent-activities`,
    TASK_DISTRIBUTION: `${BASE_URL}/dashboard/task-distribution`,
    TEAM_PERFORMANCE: `${BASE_URL}/dashboard/team-performance`
  },

  // Time Tracking
  TIME_LOGS: {
    BASE: `${BASE_URL}/time-logs`,
    BY_ID: (id: number) => `${BASE_URL}/time-logs/${id}`,
    BY_TASK: (taskId: number) => `${BASE_URL}/tasks/${taskId}/time`,
    BY_USER: (userId: number) => `${BASE_URL}/users/${userId}/time-logs`
  },

  // System Enums
  ENUMS: {
    BASE: `${BASE_URL}/enums`,
    USER_ROLES: `${BASE_URL}/enums/user-roles`,
    TASK_STATUSES: `${BASE_URL}/enums/task-statuses`,
    TASK_PRIORITIES: `${BASE_URL}/enums/task-priorities`,
    TASK_TYPES: `${BASE_URL}/enums/task-types`,
    PROJECT_STATUSES: `${BASE_URL}/enums/project-statuses`,
    SPRINT_STATUSES: `${BASE_URL}/enums/sprint-statuses`
  }
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'task_manager_access_token',
  REFRESH_TOKEN: 'task_manager_refresh_token',
  USER: 'task_manager_user',
  PREFERENCES: 'task_manager_preferences',
  THEME: 'task_manager_theme'
};

// Application Configuration
export const APP_CONFIG = {
  API_TIMEOUT: 30000,
  MAX_FILE_SIZE: 10485760, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  DEBOUNCE_TIME: 300,
  NOTIFICATION_TIMEOUT: 5000,
  AUTO_SAVE_INTERVAL: 30000,
  PAGINATION_SIZE: 20,
  MAX_SPRINT_DURATION_DAYS: 30
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// Task Management Constants
export const TASK_PRIORITIES = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

export const TASK_STATUSES = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  TESTING: 'TESTING',
  BLOCKED: 'BLOCKED',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
  DEPLOYED: 'DEPLOYED'
};

export const TASK_TYPES = {
  FEATURE: 'FEATURE',
  BUG: 'BUG',
  ENHANCEMENT: 'ENHANCEMENT',
  REFACTOR: 'REFACTOR',
  DOCUMENTATION: 'DOCUMENTATION',
  TESTING: 'TESTING',
  DEPLOYMENT: 'DEPLOYMENT',
  RESEARCH: 'RESEARCH',
  MAINTENANCE: 'MAINTENANCE',
  SECURITY: 'SECURITY'
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TEAM_LEAD: 'TEAM_LEAD',
  SENIOR_DEVELOPER: 'SENIOR_DEVELOPER',
  DEVELOPER: 'DEVELOPER',
  QA_ENGINEER: 'QA_ENGINEER',
  DEVOPS_ENGINEER: 'DEVOPS_ENGINEER',
  UI_UX_DESIGNER: 'UI_UX_DESIGNER',
  BUSINESS_ANALYST: 'BUSINESS_ANALYST',
  PRODUCT_OWNER: 'PRODUCT_OWNER',
  SCRUM_MASTER: 'SCRUM_MASTER'
};

export const SPRINT_STATUSES = {
  PLANNED: 'PLANNED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const PROJECT_STATUSES = {
  PLANNING: 'PLANNING',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  TASK_UPDATED: 'TASK_UPDATED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  TASK_OVERDUE: 'TASK_OVERDUE',
  COMMENT_ADDED: 'COMMENT_ADDED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  SPRINT_STARTED: 'SPRINT_STARTED',
  SPRINT_COMPLETED: 'SPRINT_COMPLETED',
  MENTION: 'MENTION'
};