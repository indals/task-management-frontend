// API Constants for comprehensive task management system
const BASE_URL = 'http://localhost:5000/api'; // Update this to your backend URL

export const API_ENDPOINTS = {
  AUTH: {
    BASE: `${BASE_URL}/auth`,
    LOGIN: `${BASE_URL}/auth/login`,
    REGISTER: `${BASE_URL}/auth/register`,
    PROFILE: `${BASE_URL}/auth/profile`,
    ME: `${BASE_URL}/auth/me`,
    CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
    USERS: `${BASE_URL}/auth/users`,
    PING: `${BASE_URL}/auth/ping`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    REFRESH: `${BASE_URL}/auth/refresh`
  },
  PROJECTS: {
    BASE: `${BASE_URL}/projects`,
    BY_ID: (id: number) => `${BASE_URL}/projects/${id}`,
    BY_USERNAME: (username: string) => `${BASE_URL}/projects/user/${username}`,
    CONTRIBUTORS: (projectId: number) => `${BASE_URL}/projects/${projectId}/contributors`,
    REMOVE_CONTRIBUTOR: (projectId: number, username: string) => `${BASE_URL}/projects/${projectId}/contributors/${username}`,
    RECENT: `${BASE_URL}/projects/recent`,
    ARCHIVE: (id: number) => `${BASE_URL}/projects/${id}/archive`
  },
  TASKS: {
    BASE: `${BASE_URL}/tasks`,
    BY_ID: (id: number) => `${BASE_URL}/tasks/${id}`,
    BY_PROJECT: (projectId: number) => `${BASE_URL}/projects/${projectId}/tasks`,
    COMMENTS: (taskId: number) => `${BASE_URL}/tasks/${taskId}/comments`,
    ASSIGN: (taskId: number) => `${BASE_URL}/tasks/${taskId}/assign`,
    UNASSIGN: (taskId: number) => `${BASE_URL}/tasks/${taskId}/unassign`,
    STATUS: (taskId: number) => `${BASE_URL}/tasks/${taskId}/status`,
    BULK: `${BASE_URL}/tasks/bulk`,
    BULK_DELETE: `${BASE_URL}/tasks/bulk-delete`,
    ASSIGNEES: (projectId: number, taskId: number) => `${BASE_URL}/projects/${projectId}/tasks/${taskId}/assignees`,
    UPDATE_STATUS: (projectId: number, taskId: number) => `${BASE_URL}/projects/${projectId}/tasks/${taskId}/status`
  },
  NOTIFICATIONS: {
    BASE: `${BASE_URL}/notifications`,
    MARK_READ: (id: number) => `${BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${BASE_URL}/notifications/mark-all-read`
  },
  ANALYTICS: {
    BASE: `${BASE_URL}/analytics`,
    DASHBOARD: `${BASE_URL}/analytics/dashboard`,
    PROJECT_STATS: (projectId: number) => `${BASE_URL}/analytics/projects/${projectId}`,
    USER_STATS: (userId: number) => `${BASE_URL}/analytics/users/${userId}`,
    TASK_STATS: `${BASE_URL}/analytics/tasks`
  },
  ADMIN: {
    BASE: `${BASE_URL}/admin`,
    USERS: `${BASE_URL}/admin/users`,
    SYSTEM_STATS: `${BASE_URL}/admin/system-stats`
  }
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'current_user',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'user_theme',
  LANGUAGE: 'user_language'
};

export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  SUPPORTED_FILE_TYPES: ['application/pdf', 'text/plain', 'application/msword'],
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  PAGINATION_SIZES: [5, 10, 25, 50, 100],
  TASK_PRIORITIES: ['LOW', 'MEDIUM', 'HIGH'],
  TASK_STATUSES: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
  PROJECT_STATUSES: ['ACTIVE', 'COMPLETED', 'ARCHIVED']
};