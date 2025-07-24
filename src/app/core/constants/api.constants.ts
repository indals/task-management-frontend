import { environment } from '../../../environments/environment';

// API Base URLs
export const API_BASE_URL = environment.apiUrl || 'http://127.0.0.1:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    ME: `${API_BASE_URL}/auth/me`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    USERS: `${API_BASE_URL}/auth/users`,
    PING: `${API_BASE_URL}/auth/ping`
  },
  TASKS: {
    BASE: `${API_BASE_URL}/tasks`,
    BY_ID: (id: number) => `${API_BASE_URL}/tasks/${id}`,
    COMMENTS: (id: number) => `${API_BASE_URL}/tasks/${id}/comments`
  },
  PROJECTS: {
    BASE: `${API_BASE_URL}/projects`,
    BY_ID: (id: number) => `${API_BASE_URL}/projects/${id}`
  },
  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/notifications`,
    LIST: `${API_BASE_URL}/notifications`,
    CREATE: `${API_BASE_URL}/notifications`,
    MARK_READ: `${API_BASE_URL}/notifications/:id/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/read-all`,
    DELETE: `${API_BASE_URL}/notifications/:id`
  },
  ANALYTICS: {
    TASK_COMPLETION: `${API_BASE_URL}/analytics/task-completion`,
    TASK_STATUS_DISTRIBUTION: `${API_BASE_URL}/analytics/task-status-distribution`,
    TASK_PRIORITY_DISTRIBUTION: `${API_BASE_URL}/analytics/task-priority-distribution`
  }
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'access_token',
  USER: 'user',
  REFRESH_TOKEN: 'refresh_token'
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Task Manager',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['image/*', '.pdf', '.doc', '.docx', '.txt']
};