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
    COMMENTS: (taskId: number) => `${environment.apiUrl}/tasks/${taskId}/comments`
  },
  PROJECTS: {
    BASE: `${environment.apiUrl}/projects`,
    BY_ID: (id: number) => `${environment.apiUrl}/projects/${id}`
  },
  NOTIFICATIONS: {
    BASE: `${environment.apiUrl}/notifications`,
    MARK_READ: (id: number) => `${environment.apiUrl}/notifications/${id}/read`
  }
};

export const STORAGE_KEYS = {
  TOKEN: environment.tokenKey,
  USER: environment.userKey
};

export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
};