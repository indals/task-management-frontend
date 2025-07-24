# Task Management System - Angular Frontend

A modern, scalable Angular 18 application for task management with clean architecture and best practices.

## 🏗️ Project Architecture

This project follows Angular best practices with a clean, modular architecture:

```
src/app/
├── core/                          # Singleton services, guards, interceptors
│   ├── constants/                 # Application constants
│   │   └── api.constants.ts      # API endpoints and configuration
│   ├── guards/                    # Route guards
│   │   ├── auth.guard.ts         # Authentication guard (functional)
│   │   └── index.ts              # Barrel exports
│   ├── interceptors/             # HTTP interceptors
│   │   ├── jwt.interceptor.ts    # JWT token injection
│   │   ├── error.interceptor.ts  # Global error handling
│   │   └── index.ts              # Barrel exports
│   ├── interfaces/               # API interfaces
│   │   ├── api.interfaces.ts     # Request/Response interfaces
│   │   └── index.ts              # Barrel exports
│   ├── models/                   # Business domain models
│   │   ├── user.model.ts
│   │   ├── task.model.ts
│   │   ├── project.model.ts
│   │   ├── enums.ts              # Application enums
│   │   └── index.ts              # Barrel exports
│   ├── services/                 # Core business services
│   │   ├── auth.service.ts       # Authentication service
│   │   ├── task.service.ts       # Task management
│   │   ├── error-handler.service.ts # Error handling
│   │   └── index.ts              # Barrel exports
│   ├── core.module.ts            # Core module (import once)
│   └── index.ts                  # Main core barrel export
│
├── shared/                       # Reusable components, pipes, directives
│   ├── components/               # Shared components
│   │   ├── header/
│   │   ├── sidebar/
│   │   ├── loading/
│   │   ├── confirmation-dialog/  # Reusable dialog
│   │   └── index.ts
│   ├── directives/               # Custom directives
│   │   ├── click-outside.directive.ts
│   │   └── index.ts
│   ├── pipes/                    # Custom pipes
│   │   ├── status-color.pipe.ts
│   │   └── index.ts
│   ├── shared.module.ts          # Shared module
│   └── index.ts                  # Main shared barrel export
│
├── features/                     # Feature modules (lazy loaded)
│   ├── auth/                     # Authentication feature
│   │   ├── login/                # Standalone component
│   │   ├── register/             # Standalone component
│   │   ├── profile/              # Standalone component
│   │   ├── auth-routing.module.ts
│   │   └── auth.module.ts
│   ├── dashboard/                # Dashboard feature
│   ├── tasks/                    # Task management feature
│   ├── projects/                 # Project management feature
│   ├── calendar/                 # Calendar feature
│   ├── reports/                  # Reports feature
│   └── notifications/            # Notifications feature
│
├── app-routing.module.ts         # Main routing configuration
├── app.component.ts              # Root component
├── app.module.ts                 # Root module
└── environments/                 # Environment configurations
    ├── environment.ts            # Development environment
    └── environment.prod.ts       # Production environment
```

## 🎯 Architecture Principles

### Core Module Pattern
- **Single Instance**: Core module can only be imported once (in AppModule)
- **Singleton Services**: Authentication, HTTP services, guards
- **Global Configuration**: API endpoints, constants, error handling

### Shared Module Pattern
- **Reusable Components**: Header, sidebar, loading components
- **Common Utilities**: Pipes, directives, validators
- **Angular Modules Re-export**: CommonModule, ReactiveFormsModule, etc.

### Feature Module Pattern
- **Lazy Loading**: Each feature is loaded on demand
- **Self-Contained**: Each feature has its own routing and components
- **Standalone Components**: Modern Angular approach for better tree-shaking

### Barrel Exports (index.ts)
- **Clean Imports**: Simplified import statements
- **Better Maintainability**: Easy to refactor and reorganize
- **Encapsulation**: Control what gets exported from each module

## 🔧 Key Features

### Modern Angular Patterns
- ✅ Functional Guards (authGuard)
- ✅ Standalone Components
- ✅ Lazy Loading with loadComponent/loadChildren
- ✅ Barrel Exports for clean imports
- ✅ TypeScript strict mode
- ✅ RxJS best practices

### Security & Error Handling
- ✅ JWT Authentication with automatic token refresh
- ✅ Route protection with guards
- ✅ Global error interceptor
- ✅ Centralized error handling service
- ✅ Environment-based configuration

### Performance Optimization
- ✅ Lazy loading for all features
- ✅ OnPush change detection strategy
- ✅ Tree-shakable imports
- ✅ Bundle optimization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Angular CLI 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd task-manager-frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Configuration
Update the API URL in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://your-api-domain.com/api',
  // ... other configuration
};
```

## 📝 Development Guidelines

### Code Organization
1. **Use barrel exports** for clean imports
2. **Follow the single responsibility principle**
3. **Keep components focused and small**
4. **Use TypeScript interfaces** for type safety
5. **Implement proper error handling**

### Component Development
```typescript
// ✅ Good: Standalone component with proper imports
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `...`
})
export class ExampleComponent { }

// ✅ Good: Using proper imports from barrel files
import { User, Task } from '@core/models';
import { AuthService } from '@core/services';
```

### Service Development
```typescript
// ✅ Good: Proper error handling and type safety
@Injectable({ providedIn: 'root' })
export class ExampleService {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getData(): Observable<SomeType> {
    return this.http.get<SomeType>(API_ENDPOINTS.SOME_ENDPOINT)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }
}
```

### State Management
- Use services with BehaviorSubject for simple state
- Consider NgRx for complex state management
- Implement proper loading and error states

## 🔒 Authentication Flow

1. User logs in → JWT token stored in localStorage
2. AuthGuard protects routes → checks token validity
3. JwtInterceptor adds token to API requests
4. ErrorInterceptor handles 401/403 responses
5. Auto-logout on token expiration

## 📊 Available Scripts

```bash
npm start           # Development server
npm run build       # Production build
npm run test        # Run unit tests
npm run lint        # Run ESLint
npm run e2e         # Run e2e tests
```

## 🏷️ Folder Naming Conventions

- **kebab-case** for files and folders
- **PascalCase** for classes and interfaces
- **camelCase** for properties and methods
- **SCREAMING_SNAKE_CASE** for constants

## 🔄 Git Workflow

1. Create feature branch: `git checkout -b feature/task-management`
2. Commit changes: `git commit -m "feat: add task creation"`
3. Push branch: `git push origin feature/task-management`
4. Create Pull Request

## 📚 Additional Resources

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [RxJS Best Practices](https://rxjs.dev/guide/operators)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write unit tests for new features
3. Update documentation for significant changes
4. Follow the coding standards and conventions
5. Ensure all builds pass before submitting PR

For questions or issues, please create a GitHub issue or contact the development team.
