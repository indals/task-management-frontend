import { User, Task, Project, Notification } from '../models';

// Generic API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// Error Response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// Auth API Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Task API Interfaces
export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date: string;
  assigneeId: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string;
  assigned_to?: number;
}

export interface TaskFilters {
  status?: string;
  assignee?: number;
  created_by?: number;
  priority?: string;
  page?: number;
  limit?: number;
}

// Project API Interfaces
export interface CreateProjectRequest {
  name: string;
  description: string;
  start_date: string;
  end_date?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}