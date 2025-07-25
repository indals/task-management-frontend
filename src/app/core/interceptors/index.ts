// Interceptors
export * from './jwt.interceptor';
export * from './error.interceptor';
export * from './loading.interceptor';

// Re-export for convenience
export { JwtInterceptor } from './jwt.interceptor';
export { ErrorInterceptor } from './error.interceptor';
export { LoadingInterceptor, LoadingService } from './loading.interceptor';

// HTTP Interceptor providers for app.config.ts or app.module.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { ErrorInterceptor } from './error.interceptor';
import { LoadingInterceptor } from './loading.interceptor';

export const HTTP_INTERCEPTOR_PROVIDERS = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: JwtInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: LoadingInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
  }
];