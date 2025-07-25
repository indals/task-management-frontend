import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { APP_CONFIG } from '../constants/api.constants';
import { ErrorResponse } from '../models';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(this.shouldRetry(request) ? APP_CONFIG.RETRY_ATTEMPTS : 0),
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let userFriendlyMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
      userFriendlyMessage = 'A network error occurred. Please check your connection and try again.';
    } else {
      // Server-side error
      const errorResponse: ErrorResponse = error.error;
      
      switch (error.status) {
        case 400:
          errorMessage = this.extractErrorMessage(errorResponse);
          userFriendlyMessage = 'Invalid request. Please check your input and try again.';
          break;
          
        case 401:
          errorMessage = 'Authentication failed';
          userFriendlyMessage = 'Your session has expired. Please log in again.';
          break;
          
        case 403:
          errorMessage = 'Access forbidden';
          userFriendlyMessage = 'You do not have permission to perform this action.';
          break;
          
        case 404:
          errorMessage = 'Resource not found';
          userFriendlyMessage = 'The requested resource could not be found.';
          break;
          
        case 409:
          errorMessage = this.extractErrorMessage(errorResponse);
          userFriendlyMessage = 'A conflict occurred. The resource may have been modified by another user.';
          break;
          
        case 422:
          errorMessage = this.extractValidationErrors(errorResponse);
          userFriendlyMessage = 'Please check your input and correct any validation errors.';
          break;
          
        case 429:
          errorMessage = 'Too many requests';
          userFriendlyMessage = 'You are making requests too quickly. Please wait a moment and try again.';
          break;
          
        case 500:
          errorMessage = 'Internal server error';
          userFriendlyMessage = 'A server error occurred. Please try again later or contact support if the problem persists.';
          break;
          
        case 502:
          errorMessage = 'Bad gateway';
          userFriendlyMessage = 'The server is temporarily unavailable. Please try again later.';
          break;
          
        case 503:
          errorMessage = 'Service unavailable';
          userFriendlyMessage = 'The service is temporarily unavailable. Please try again later.';
          break;
          
        case 504:
          errorMessage = 'Gateway timeout';
          userFriendlyMessage = 'The request timed out. Please try again.';
          break;
          
        case 0:
          errorMessage = 'Network error';
          userFriendlyMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
          
        default:
          if (errorResponse?.message) {
            errorMessage = errorResponse.message;
          } else {
            errorMessage = `HTTP Error ${error.status}: ${error.statusText}`;
          }
          userFriendlyMessage = 'An unexpected error occurred. Please try again.';
      }
    }

    // Show user-friendly error message (except for 401 which is handled by auth service)
    if (error.status !== 401 && this.shouldShowErrorToUser(error)) {
      this.showErrorMessage(userFriendlyMessage || errorMessage);
    }

    // Log detailed error for debugging
    this.logError(error, errorMessage);

    return throwError(() => new Error(errorMessage));
  }

  private extractErrorMessage(errorResponse: ErrorResponse): string {
    if (errorResponse?.message) {
      return errorResponse.message;
    }
    
    if (errorResponse?.errors && Array.isArray(errorResponse.errors) && errorResponse.errors.length > 0) {
      return errorResponse.errors[0];
    }
    
    return 'An error occurred';
  }

  private extractValidationErrors(errorResponse: ErrorResponse): string {
    if (errorResponse?.errors && Array.isArray(errorResponse.errors)) {
      return errorResponse.errors.join(', ');
    }
    
    if (errorResponse?.message) {
      return errorResponse.message;
    }
    
    return 'Validation failed';
  }

  private shouldRetry(request: HttpRequest<any>): boolean {
    // Only retry GET requests and avoid retrying authentication requests
    return request.method === 'GET' && 
           !request.url.includes('/auth/') &&
           !request.url.includes('/logout');
  }

  private shouldShowErrorToUser(error: HttpErrorResponse): boolean {
    // Don't show errors for certain endpoints
    const silentEndpoints = [
      '/auth/refresh',
      '/auth/ping',
      '/health'
    ];
    
    return !silentEndpoints.some(endpoint => error.url?.includes(endpoint));
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private logError(error: HttpErrorResponse, errorMessage: string): void {
    console.group('🚨 HTTP Error Details');
    console.error('Status:', error.status);
    console.error('URL:', error.url);
    console.error('Method:', error.url ? 'Unknown' : 'GET'); // We don't have access to method here
    console.error('Message:', errorMessage);
    console.error('Full Error:', error);
    
    if (error.error?.errors) {
      console.error('Validation Errors:', error.error.errors);
    }
    
    if (error.headers) {
      console.error('Response Headers:', error.headers.keys().map(key => ({
        [key]: error.headers.get(key)
      })));
    }
    
    console.groupEnd();

    // In production, you might want to send this to a logging service
    if (error.status >= 500) {
      this.logToExternalService(error, errorMessage);
    }
  }

  private logToExternalService(error: HttpErrorResponse, errorMessage: string): void {
    // TODO: Implement external logging service integration
    // Example: Send to Sentry, LogRocket, or custom logging endpoint
    
    const errorData = {
      timestamp: new Date().toISOString(),
      status: error.status,
      url: error.url,
      message: errorMessage,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    };

    // Example: this.loggingService.logError(errorData);
    console.info('Error logged for external service:', errorData);
  }

  private getCurrentUserId(): string | null {
    try {
      const userStr = localStorage.getItem('user-info');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id?.toString() || null;
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  }

  private getSessionId(): string | null {
    // Generate or retrieve session ID for tracking
    let sessionId = sessionStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }
}