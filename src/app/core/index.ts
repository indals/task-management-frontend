// Main barrel file for core module
export * from './core.module';

// Models - export all model types
export * from './models/user.model';
export * from './models/task.model';
export * from './models/project.model';
export * from './models/notification.model';
export * from './models/comment.model';
export * from './models/analytics.model';
export * from './models/api-responses';
export * from './models/enums';

// Auth model exports (avoid conflicts with interfaces)
export type { 
  LoginRequest as AuthLoginRequest, 
  RegisterRequest as AuthRegisterRequest, 
  AuthResponse as AuthResponseModel 
} from './models/auth.model';

// API Interfaces - export with specific names to avoid conflicts
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

// Services - only export the services, not their internal interfaces
export { AuthService } from './services/auth.service';
export { TaskService } from './services/task.service';
export { ProjectService } from './services/project.service';
export { NotificationService } from './services/notification.service';
export { AnalyticsService } from './services/analytics.service';
export { LayoutService } from './services/layout.service';
export { ErrorHandlerService } from './services/error-handler.service';

// Guards
export * from './guards';

// Interceptors
export * from './interceptors';

// Constants
export * from './constants/api.constants';