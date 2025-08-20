// src/app/core/interceptors/index.ts - CORRECTED VERSION

// Interceptors
export * from './jwt.interceptor';
export * from './error.interceptor';
// REMOVED: export * from './loading.interceptor';

// Re-export for convenience
export { JwtInterceptor } from './jwt.interceptor';
export { ErrorInterceptor } from './error.interceptor';
// REMOVED: export { LoadingInterceptor, LoadingService } from './loading.interceptor';

// HTTP Interceptor providers for app.config.ts or app.module.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { ErrorInterceptor } from './error.interceptor';
// REMOVED: import { LoadingInterceptor } from './loading.interceptor';

export const HTTP_INTERCEPTOR_PROVIDERS = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: JwtInterceptor,
    multi: true
  },
  // REMOVED: LoadingInterceptor completely
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
  }
];