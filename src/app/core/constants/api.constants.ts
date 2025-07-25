// src/app/core/constants/api.constants.ts
import { environment } from '../../../environments/environment';

const BASE_URL = environment?.apiUrl || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    BASE: `${BASE_URL}/auth`,
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    REFRESH: `${BASE_URL}/auth/refresh`,
    PROFILE: `${BASE_URL}/auth/profile`,
    ME: `${BASE_URL}/auth/me`,
    CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
    USERS: `${BASE_URL}/users`,
    USER_BY_ID: (id: number) => `${BASE_URL}/users/${id}`,
    PING: `${BASE_URL}/auth/ping`
  },
  TASKS: {
    BASE: `${BASE_URL}/tasks`,
    BY_ID: (id: number) => `${BASE_URL}/tasks/${id}`,
    COMMENTS: (taskId: number) => `${BASE_URL}/tasks/${taskId}/comments`,
    COMMENT_BY_ID: (taskId: number, commentId: number) => `${BASE_URL}/tasks/${taskId}/comments/${commentId}`,
    ASSIGN: (taskId: number) => `${BASE_URL}/tasks/${taskId}/assign`,
    UNASSIGN: (taskId: number) => `${BASE_URL}/tasks/${taskId}/unassign`,
    STATUS: (taskId: number) => `${BASE_URL}/tasks/${taskId}/status`,
    BULK_UPDATE: `${BASE_URL}/tasks/bulk-update`,
    BULK_DELETE: `${BASE_URL}/tasks/bulk-delete`,
    SEARCH: `${BASE_URL}/tasks/search`,
    EXPORT: `${BASE_URL}/tasks/export`
  },
  PROJECTS: {
    BASE: `${BASE_URL}/projects`,
    BY_ID: (id: number) => `${BASE_URL}/projects/${id}`,
    TASKS: (projectId: number) => `${BASE_URL}/projects/${projectId}/tasks`,
    MEMBERS: (projectId: number) => `${BASE_URL}/projects/${projectId}/members`,
    ADD_MEMBER: (projectId: number) => `${BASE_URL}/projects/${projectId}/members`,
    REMOVE_MEMBER: (projectId: number, userId: number) => `${BASE_URL}/projects/${projectId}/members/${userId}`
  },
  TEAMS: {
    BASE: `${BASE_URL}/teams`,
    BY_ID: (id: number) => `${BASE_URL}/teams/${id}`,
    MEMBERS: (teamId: number) => `${BASE_URL}/teams/${teamId}/members`,
    ADD_MEMBER: (teamId: number) => `${BASE_URL}/teams/${teamId}/members`,
    REMOVE_MEMBER: (teamId: number, userId: number) => `${BASE_URL}/teams/${teamId}/members/${userId}`,
    INVITATIONS: `${BASE_URL}/teams/invitations`,
    ACCEPT_INVITATION: (invitationId: number) => `${BASE_URL}/teams/invitations/${invitationId}/accept`,
    DECLINE_INVITATION: (invitationId: number) => `${BASE_URL}/teams/invitations/${invitationId}/decline`
  },
  NOTIFICATIONS: {
    BASE: `${BASE_URL}/notifications`,
    BY_ID: (id: number) => `${BASE_URL}/notifications/${id}`,
    MARK_READ: (id: number) => `${BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${BASE_URL}/notifications/mark-all-read`,
    UNREAD_COUNT: `${BASE_URL}/notifications/unread-count`
  },
  DASHBOARD: {
    STATS: `${BASE_URL}/dashboard/stats`,
    RECENT_ACTIVITIES: `${BASE_URL}/dashboard/recent-activities`,
    TASK_DISTRIBUTION: `${BASE_URL}/dashboard/task-distribution`,
    TEAM_PERFORMANCE: `${BASE_URL}/dashboard/team-performance`
  },
  CATEGORIES: {
    BASE: `${BASE_URL}/categories`,
    BY_ID: (id: number) => `${BASE_URL}/categories/${id}`
  },
  ATTACHMENTS: {
    BASE: `${BASE_URL}/attachments`,
    BY_ID: (id: number) => `${BASE_URL}/attachments/${id}`,
    UPLOAD: `${BASE_URL}/attachments/upload`,
    TASK_ATTACHMENTS: (taskId: number) => `${BASE_URL}/tasks/${taskId}/attachments`
  }
};

export const STORAGE_KEYS = {
  TOKEN: 'task_manager_token',
  REFRESH_TOKEN: 'task_manager_refresh_token',
  USER: 'task_manager_user',
  PREFERENCES: 'task_manager_preferences'
};

export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  SUPPORTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  DEBOUNCE_TIME: 300, // milliseconds for search debouncing
  NOTIFICATION_TIMEOUT: 5000, // milliseconds
  AUTO_SAVE_INTERVAL: 30000 // 30 seconds for auto-save
};

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
} as const;

export const TASK_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const;

export const TASK_STATUSES = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED'
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE'
} as const;