import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Services
import {
  AuthService,
  TaskService,
  ProjectService,
  NotificationService,
  AnalyticsService,
  LayoutService,
  ErrorHandlerService
} from './services';

// Guards
import { AuthGuard } from './guards';

// Interceptors
import { JwtInterceptor, ErrorInterceptor } from './interceptors';

@NgModule({
  imports: [CommonModule],
  providers: [
    // Core Services
    AuthService,
    TaskService,
    ProjectService,
    NotificationService,
    AnalyticsService,
    LayoutService,
    ErrorHandlerService,
    
    // Guards
    AuthGuard,
    
    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  // Prevent multiple imports of CoreModule
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }

  // Optional: Use forRoot pattern for configuration
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        // Any additional providers can be added here
      ]
    };
  }
}
