// src/app/core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle authentication errors
        if (error.status === 401) {
          this.handle401Error();
        }
        
        // Handle forbidden errors
        if (error.status === 403) {
          this.handle403Error();
        }

        // Handle server errors
        if (error.status >= 500) {
          this.handle5xxError(error);
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(): void {
    // Token has expired or is invalid
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private handle403Error(): void {
    // User doesn't have permission
    console.warn('Access forbidden. Redirecting to dashboard.');
    this.router.navigate(['/dashboard']);
  }

  private handle5xxError(error: HttpErrorResponse): void {
    console.error('Server error occurred:', error);
    // You might want to show a global error message here
    // or redirect to an error page
  }
}