import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  AUTH: {
    BASE: `${environment.apiUrl}/auth`,
    LOGIN: `${environment.apiUrl}/auth/login`,
    REGISTER: `${environment.apiUrl}/auth/register`,
    PROFILE: `${environment.apiUrl}/auth/profile`,
    ME: `${environment.apiUrl}/auth/me`,
    CHANGE_PASSWORD: `${environment.apiUrl}/auth/change-password`,
    USERS: `${environment.apiUrl}/auth/users`,
    PING: `${environment.apiUrl}/auth/ping`
  },
  TASKS: {
    BASE: `${environment.apiUrl}/tasks`,
    BY_ID: (id: number) => `${environment.apiUrl}/tasks/${id}`,
    BULK: `${environment.apiUrl}/tasks/bulk`,
    BULK_DELETE: `${environment.apiUrl}/tasks/bulk`,
    ASSIGN: (taskId: number) => `${environment.apiUrl}/tasks/${taskId}/assign`,
    COMMENTS: (taskId: number) => `${environment.apiUrl}/tasks/${taskId}/comments`,
    COMMENT_BY_ID: (commentId: number) => `${environment.apiUrl}/tasks/comments/${commentId}`,
    BY_STATUS: (status: string) => `${environment.apiUrl}/tasks?status=${status}`,
    BY_USER: (userId: number) => `${environment.apiUrl}/tasks?assignee=${userId}`,
    BY_PRIORITY: (priority: string) => `${environment.apiUrl}/tasks?priority=${priority}`,
    SEARCH: `${environment.apiUrl}/tasks/search`,
    EXPORT: `${environment.apiUrl}/tasks/export`,
    STATISTICS: `${environment.apiUrl}/tasks/statistics`
  },
  PROJECTS: {
    BASE: `${environment.apiUrl}/projects`,
    BY_ID: (id: number) => `${environment.apiUrl}/projects/${id}`,
    MEMBERS: (id: number) => `${environment.apiUrl}/projects/${id}/members`,
    TASKS: (id: number) => `${environment.apiUrl}/projects/${id}/tasks`,
    STATISTICS: (id: number) => `${environment.apiUrl}/projects/${id}/statistics`
  },
  USERS: {
    BASE: `${environment.apiUrl}/users`,
    BY_ID: (id: number) => `${environment.apiUrl}/users/${id}`,
    PROFILE: `${environment.apiUrl}/users/profile`,
    SEARCH: `${environment.apiUrl}/users/search`,
    STATISTICS: `${environment.apiUrl}/users/statistics`
  },
  NOTIFICATIONS: {
    BASE: `${environment.apiUrl}/notifications`,
    MARK_READ: (id: number) => `${environment.apiUrl}/notifications/${id}/read`,
    MARK_ALL_READ: `${environment.apiUrl}/notifications/mark-all-read`,
    UNREAD_COUNT: `${environment.apiUrl}/notifications/unread-count`
  },
  REPORTS: {
    BASE: `${environment.apiUrl}/reports`,
    TASK_SUMMARY: `${environment.apiUrl}/reports/task-summary`,
    USER_PRODUCTIVITY: `${environment.apiUrl}/reports/user-productivity`,
    PROJECT_PROGRESS: `${environment.apiUrl}/reports/project-progress`,
    EXPORT: `${environment.apiUrl}/reports/export`
  },
  DASHBOARD: {
    OVERVIEW: `${environment.apiUrl}/dashboard/overview`,
    RECENT_ACTIVITIES: `${environment.apiUrl}/dashboard/recent-activities`,
    STATISTICS: `${environment.apiUrl}/dashboard/statistics`,
    CHARTS: `${environment.apiUrl}/dashboard/charts`
  },
  CALENDAR: {
    EVENTS: `${environment.apiUrl}/calendar/events`,
    BY_DATE: (date: string) => `${environment.apiUrl}/calendar/events?date=${date}`,
    BY_MONTH: (month: string, year: string) => `${environment.apiUrl}/calendar/events?month=${month}&year=${year}`
  }
};

export const STORAGE_KEYS = {
  TOKEN: environment.tokenKey,
  USER: environment.userKey,
  THEME: 'task_manager_theme',
  LANGUAGE: 'task_manager_language',
  SIDEBAR_STATE: 'task_manager_sidebar_state',
  FILTER_PREFERENCES: 'task_manager_filter_preferences'
};

export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  NOTIFICATION_DISPLAY_TIME: 5000, // 5 seconds
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  TASK_PRIORITY_COLORS: {
    LOW: '#28a745',
    MEDIUM: '#ffc107',
    HIGH: '#dc3545'
  },
  TASK_STATUS_COLORS: {
    PENDING: '#6c757d',
    IN_PROGRESS: '#007bff',
    COMPLETED: '#28a745',
    CANCELLED: '#dc3545'
  },
  DATE_FORMATS: {
    SHORT: 'MMM d, y',
    MEDIUM: 'MMM d, y, h:mm a',
    LONG: 'MMMM d, y, h:mm:ss a'
  }
};