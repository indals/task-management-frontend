/**
 * Application-wide constants
 */
export const APP_CONSTANTS = {
  // Local Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'access_token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language'
  },

  // API Endpoints
  API_ENDPOINTS: {
    AUTH: 'auth',
    TASKS: 'tasks',
    PROJECTS: 'projects',
    USERS: 'users',
    NOTIFICATIONS: 'notifications',
    ANALYTICS: 'analytics'
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
  },

  // Date Formats
  DATE_FORMATS: {
    DISPLAY: 'MMM dd, yyyy',
    API: 'yyyy-MM-dd',
    FULL: 'MMM dd, yyyy HH:mm'
  },

  // Routes
  ROUTES: {
    AUTH: {
      LOGIN: '/login',
      REGISTER: '/register',
      PROFILE: '/profile'
    },
    DASHBOARD: '/dashboard',
    TASKS: '/tasks',
    PROJECTS: '/projects',
    CALENDAR: '/calendar',
    REPORTS: '/reports',
    NOTIFICATIONS: '/notifications'
  }
} as const;