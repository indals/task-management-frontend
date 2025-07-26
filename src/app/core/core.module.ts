import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Material modules for interceptors
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { AuthService } from './services/auth.service';
import { TaskService } from './services/task.service';
import { ProjectService } from './services/project.service';
import { SprintService } from './services/sprint.service';
import { NotificationService } from './services/notification.service';
import { AnalyticsService } from './services/analytics.service';
import { EnumService } from './services/enum.service';
import { LayoutService } from './services/layout.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { LoadingService } from './interceptors/loading.interceptor';

// Interceptors
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

// Guards
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  providers: [
    // Core Services
    AuthService,
    TaskService,
    ProjectService,
    SprintService,
    NotificationService,
    AnalyticsService,
    EnumService,
    LayoutService,
    ErrorHandlerService,
    LoadingService,
    
    // Guards
    AuthGuard,
    
    // HTTP Interceptors (order matters!)
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
  ],
  exports: [
    // Export material modules that might be used by other modules
    MatSnackBarModule,
    MatProgressSpinnerModule
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}