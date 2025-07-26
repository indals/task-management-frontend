// Fixed core/models/error.model.ts - Standardized error response types

// Standard API Error Response
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  error_code?: string;
  status?: number;
  timestamp: string;
  path?: string;
}

// Alternative error response formats that might be returned by API
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

// Validation error for form validation
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

// Client-side error wrapper
export interface ClientError {
  message: string;
  status?: number;
  errors?: string[];
  code?: string;
  originalError?: any;
}

// HTTP Error types for better error handling
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM', 
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Structured error for application use
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  code?: string;
  timestamp: Date;
  userId?: number;
  requestId?: string;
  stackTrace?: string;
}

// Helper functions for error handling
export class ErrorUtils {
  static getErrorType(status: number): ErrorType {
    if (status === 0) return ErrorType.NETWORK_ERROR;
    if (status === 401) return ErrorType.AUTHENTICATION_ERROR;
    if (status === 403) return ErrorType.AUTHORIZATION_ERROR;
    if (status === 404) return ErrorType.NOT_FOUND_ERROR;
    if (status === 422) return ErrorType.VALIDATION_ERROR;
    if (status === 408 || status === 504) return ErrorType.TIMEOUT_ERROR;
    if (status >= 500) return ErrorType.SERVER_ERROR;
    if (status >= 400) return ErrorType.CLIENT_ERROR;
    return ErrorType.UNKNOWN_ERROR;
  }

  static getErrorSeverity(status: number): ErrorSeverity {
    if (status >= 500) return ErrorSeverity.CRITICAL;
    if (status === 401 || status === 403) return ErrorSeverity.HIGH;
    if (status >= 400) return ErrorSeverity.MEDIUM;
    return ErrorSeverity.LOW;
  }

  static extractErrorMessage(error: any): string {
    if (error?.error?.message) return error.error.message;
    if (error?.message) return error.message;
    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors[0] || 'Validation failed';
    }
    if (typeof error?.error === 'string') return error.error;
    return 'An unexpected error occurred';
  }

  static createAppError(error: any, status?: number): AppError {
    const errorStatus = status || error?.status || 0;
    return {
      type: this.getErrorType(errorStatus),
      severity: this.getErrorSeverity(errorStatus),
      message: this.extractErrorMessage(error),
      code: error?.error?.error_code || error?.code,
      timestamp: new Date(),
      stackTrace: error?.stack
    };
  }
}