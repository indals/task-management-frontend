// Auth models
export * from './auth.model';
export * from './user.model';

// Core business models
export * from './task.model';
export * from './project.model';
export * from './sprint.model';
export * from './notification.model';

// Analytics models
export * from './analytics.model';

// System models
export * from './enum.model';
export * from './response.model';

// Re-export commonly used interfaces for convenience
export type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest 
} from './user.model';

export type { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskComment, 
  TimeLog 
} from './task.model';

export type { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest 
} from './project.model';

export type { 
  Sprint, 
  CreateSprintRequest, 
  UpdateSprintRequest, 
  SprintBurndown 
} from './sprint.model';

export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  AuthUser 
} from './auth.model';

export type { 
  ApiResponse, 
  PaginatedResponse, 
  ErrorResponse 
} from './response.model';

export type { 
  EnumValue, 
  EnumResponse, 
  DropdownOption 
} from './enum.model';

export type { 
  Notification, 
  NotificationSummary 
} from './notification.model';

export type { 
  TaskCompletionAnalytics, 
  UserProductivityAnalytics, 
  TaskStatusDistribution, 
  TaskPriorityDistribution 
} from './analytics.model';