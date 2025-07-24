// src/app/core/interceptors/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
// import { environment } from '../../../environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add auth header with jwt if user is logged in and request is to the api url
    const isLoggedIn = this.authService.isLoggedIn();
    // const isApiUrl = request.url.startsWith(environment.apiUrl);
    const isApiUrl = request.url.startsWith('http://127.0.0.1:5000/api') || request.url.startsWith('http://localhost:5000/api');
    
    if (isLoggedIn && isApiUrl) {
      const token = this.authService.getToken();
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
