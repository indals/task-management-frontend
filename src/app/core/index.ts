// Barrel file for core module
// Models - export specific types to avoid conflicts
export type { User, UserListItem } from './models/user.model';
export type { Task, Subtask } from './models/task.model';
export type { Project } from './models/project.model';
export type { Notification } from './models/notification.model';
export type { Comment } from './models/comment.model';
export type { TaskStatus, TaskPriority, UserRole as CoreUserRole } from './models/enums';

// Analytics models with specific exports (only what exists)
export type { 
  UserPerformance as CoreUserPerformance,
  TaskDistribution as CoreTaskDistribution
} from './models/analytics.model';

// Auth models with specific exports (only what exists)
export type {
  LoginRequest as CoreLoginRequest,
  RegisterRequest as CoreRegisterRequest,
  AuthResponse as CoreAuthResponse
} from './models/auth.model';

// API Response types (only what exists)
export type { CommentApiResponse } from './models/api-responses';

// Services - export only the service classes
export { AuthService } from './services/auth.service';
export { TaskService } from './services/task.service';
export { ProjectService } from './services/project.service';
export { NotificationService } from './services/notification.service';
export { AnalyticsService } from './services/analytics.service';
export { ErrorHandlerService } from './services/error-handler.service';
export { LayoutService } from './services/layout.service';

// API Interfaces - export with specific names
export type {
  LoginRequest as ApiLoginRequest,
  RegisterRequest as ApiRegisterRequest,
  AuthResponse as ApiAuthResponse,
  ChangePasswordRequest,
  CreateTaskRequest,
  UpdateTaskRequest as ApiUpdateTaskRequest,
  TaskFilters,
  CreateProjectRequest,
  UpdateProjectRequest
} from './interfaces/api.interfaces';

// Constants
export * from './constants/api.constants';

// Interceptors
export * from './interceptors/jwt.interceptor';
export * from './interceptors/error.interceptor';

// Guards - export specific items to avoid conflicts
export { authGuard, AuthGuard } from './guards/auth.guard';
export { roleGuard, hasRole, hasAnyRole, RoleGuard } from './guards/role.guard';
export type { UserRole } from './guards/role.guard';