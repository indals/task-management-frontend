// Fixed core/interfaces/index.ts - Complete interface exports

// Barrel file for all interfaces
export * from './api.interfaces';

// Re-export common interfaces from models for backward compatibility
export type { 
  ApiResponse, 
  PaginatedResponse, 
  ErrorResponse 
} from '../models/response.model';

export type {
  User,
  CreateUserRequest,
  UpdateUserRequest
} from '../models/user.model';

export type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest
} from '../models/task.model';

export type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest
} from '../models/project.model';

export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse
} from '../models/auth.model';