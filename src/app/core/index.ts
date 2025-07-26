// Fixed core/index.ts - Complete core module exports

// Core module
export { CoreModule } from './core.module';

// Services - explicit exports
export { AuthService } from './services/auth.service';
export { TaskService } from './services/task.service';
export { ProjectService } from './services/project.service';
export { SprintService } from './services/sprint.service';
export { NotificationService } from './services/notification.service';
export { AnalyticsService } from './services/analytics.service';
export { EnumService } from './services/enum.service';
export { LayoutService } from './services/layout.service';
export { ErrorHandlerService } from './services/error-handler.service';
export { LoadingService } from './interceptors/loading.interceptor';

// Service filter types
export type { TaskFilters } from './services/task.service';
export type { ProjectFilters } from './services/project.service';
export type { SprintFilters } from './services/sprint.service';
export type { NotificationFilters } from './services/notification.service';

// Models - explicit exports to avoid conflicts
export * from './models/user.model';
export * from './models/task.model';
export * from './models/project.model';
export * from './models/sprint.model';
export * from './models/notification.model';
export * from './models/comment.model';
export * from './models/analytics.model';
export * from './models/enum.model';
export * from './models/response.model';
export * from './models/enums';

// Auth models with aliases to avoid conflicts
export type { 
  LoginRequest as AuthLoginRequest, 
  RegisterRequest as AuthRegisterRequest, 
  AuthResponse as AuthResponseModel 
} from './models/auth.model';

// Constants
export * from './constants/api.constants';

// Guards
export * from './guards';

// Interceptors
export * from './interceptors';

// Helper functions
export { normalizeCommentFromApi } from './models/comment.model';
export { ErrorUtils } from './models/error.model';