import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ApiError } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && typeof error.error === 'object') {
        apiError = error.error as ApiError;
        errorMessage = apiError.message || `Server Error: ${error.status}`;
      } else {
        errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    // Log the error for debugging (you might want to send to logging service)
    this.logError(error, errorMessage);

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      error: apiError || error.error
    }));
  }

  private logError(error: HttpErrorResponse, message: string): void {
    console.error('HTTP Error occurred:', {
      message,
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error
    });
  }

  // Method to handle specific error types
  getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}