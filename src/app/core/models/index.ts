// Fixed core/models/index.ts - Complete barrel exports

// Auth models
export * from './auth.model';
export * from './user.model';

// Core business models
export * from './task.model';
export * from './project.model';
export * from './sprint.model';
export * from './notification.model';
export * from './comment.model';

// Analytics models
export * from './analytics.model';

// System models
export * from './enum.model';
export * from './response.model';
export * from './error.model';

// Legacy enum support
export * from './enums';

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

export type {
  Comment,
  CommentApiResponse
} from './comment.model';

export type {
  ErrorResponse as StandardErrorResponse,
  ApiError,
  ValidationError,
  ClientError,
  AppError,
  ErrorType,
  ErrorSeverity
} from './error.model';

// Re-export helper functions
export { normalizeCommentFromApi } from './comment.model';
export { ErrorUtils } from './error.model';