import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Import all core services, guards, and interceptors
import { AuthService, TaskService, ProjectService, NotificationService, AnalyticsService, LayoutService } from './services';
import { AuthGuard } from './guards';
import { JwtInterceptor, ErrorInterceptor } from './interceptors';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    // Core Services
    AuthService,
    TaskService,
    ProjectService,
    NotificationService,
    AnalyticsService,
    LayoutService,
    
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
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
