// ===== UPDATED error-handler.service.ts =====
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

// Define interfaces for both old and new error formats
export interface ApiError {
  message: string;
  status?: number;
  errors?: string[];
  code?: string;
}

// New standardized response format
export interface StandardizedApiError {
  success: false;
  message: string;
  data: any;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  // 🔧 IMPROVED: Handle both new standardized and legacy error formats
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let apiError: ApiError | StandardizedApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error - handle both new and legacy formats
      if (error.error && typeof error.error === 'object') {
        const errorObj = error.error;
        
        // Check if it's new standardized format
        if (errorObj.success === false && errorObj.message) {
          // New standardized error format
          apiError = errorObj as StandardizedApiError;
          errorMessage = apiError.message;
        } else if (errorObj.message) {
          // Legacy error format
          apiError = errorObj as ApiError;
          errorMessage = apiError.message;
        } else if (errorObj.errors && Array.isArray(errorObj.errors) && errorObj.errors.length > 0) {
          // Legacy error array format
          errorMessage = errorObj.errors[0];
          apiError = { message: errorMessage, errors: errorObj.errors };
        } else {
          // Fallback for unknown format
          errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
        }
      } else {
        errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    // Log the error for debugging
    this.logError(error, errorMessage);

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      error: apiError || error.error,
      isStandardizedFormat: error.error?.success === false
    }));
  }

  // 🔧 IMPROVED: Enhanced logging with format detection
  private logError(error: HttpErrorResponse, message: string): void {
    const isNewFormat = error.error?.success === false;
    
    console.error('HTTP Error occurred:', {
      message,
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      responseFormat: isNewFormat ? 'Standardized' : 'Legacy',
      error: error.error,
      timestamp: new Date().toISOString()
    });

    // Additional logging for new format
    if (isNewFormat) {
      console.error('Standardized Error Details:', {
        success: error.error.success,
        message: error.error.message,
        data: error.error.data,
        timestamp: error.error.timestamp
      });
    }
  }

  // 🔧 IMPROVED: Handle both error formats in message extraction
  getErrorMessage(error: any): string {
    // New standardized format
    if (error?.error?.success === false && error?.error?.message) {
      return error.error.message;
    }
    
    // Legacy format with error object
    if (error?.error?.message) {
      return error.error.message;
    }
    
    // Legacy format with error array
    if (error?.error?.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
      return error.error.errors[0];
    }
    
    // Direct message property
    if (error?.message) {
      return error.message;
    }
    
    // HTTP status-based messages
    if (error?.status) {
      return this.getStatusBasedMessage(error.status);
    }
    
    return 'An unexpected error occurred';
  }

  // 🔧 NEW: Get user-friendly messages based on HTTP status codes
  private getStatusBasedMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request. Please check your input and try again.';
      case 401:
        return 'Unauthorized. Please log in and try again.';
      case 403:
        return 'Access forbidden. You don\'t have permission for this action.';
      case 404:
        return 'Resource not found. The requested item may have been deleted.';
      case 409:
        return 'Conflict. The resource already exists or there\'s a conflict.';
      case 422:
        return 'Validation failed. Please check your input data.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. The request took too long to process.';
      default:
        return `Server error (${status}). Please try again later.`;
    }
  }

  // 🔧 NEW: Check if error is from new standardized format
  isStandardizedError(error: any): boolean {
    return error?.error?.success === false && 
           typeof error?.error?.message === 'string' &&
           typeof error?.error?.timestamp === 'string';
  }

  // 🔧 NEW: Extract specific error data from standardized format
  getErrorData(error: any): any {
    if (this.isStandardizedError(error)) {
      return error.error.data;
    }
    return null;
  }

  // 🔧 NEW: Get error timestamp from standardized format
  getErrorTimestamp(error: any): string | null {
    if (this.isStandardizedError(error)) {
      return error.error.timestamp;
    }
    return null;
  }

  // 🔧 NEW: Handle authentication errors specifically
  isAuthenticationError(error: any): boolean {
    return error?.status === 401 || 
           (error?.error?.message && 
            (error.error.message.toLowerCase().includes('unauthorized') ||
             error.error.message.toLowerCase().includes('invalid credentials') ||
             error.error.message.toLowerCase().includes('token')));
  }

  // 🔧 NEW: Handle validation errors specifically
  isValidationError(error: any): boolean {
    return error?.status === 422 || 
           (error?.error?.message && 
            error.error.message.toLowerCase().includes('validation'));
  }

  // 🔧 NEW: Handle permission errors specifically
  isPermissionError(error: any): boolean {
    return error?.status === 403 || 
           (error?.error?.message && 
            (error.error.message.toLowerCase().includes('forbidden') ||
             error.error.message.toLowerCase().includes('permission')));
  }

  // 🔧 NEW: Get all validation errors if available
  getValidationErrors(error: any): string[] {
    // New format
    if (this.isStandardizedError(error) && error.error.data?.validation_errors) {
      return Array.isArray(error.error.data.validation_errors) 
        ? error.error.data.validation_errors 
        : [error.error.data.validation_errors];
    }
    
    // Legacy format
    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors;
    }
    
    return [];
  }
}