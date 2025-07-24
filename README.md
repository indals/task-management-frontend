# TaskManagerFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.




app/
├── core/                          # Singleton services and global utilities
│   ├── guards/
│   │   └── auth.guard.ts          # Route guard for auth
│   ├── interceptors/
│   │   ├── error.interceptor.ts   # Global error handler
│   │   └── jwt.interceptor.ts     # Attaches JWT to requests
│   ├── models/                    # Shared TypeScript interfaces and enums
│   │   ├── analytics.model.ts
│   │   ├── api-responses.ts
│   │   ├── auth.model.ts
│   │   ├── comment.model.ts
│   │   ├── enums.ts
│   │   ├── notification.model.ts
│   │   ├── project.model.ts
│   │   ├── subtask.model.ts
│   │   ├── task-comment.model.ts
│   │   ├── task.model.ts
│   │   └── user.model.ts
│   ├── services/
│   │   ├── analytics.service.ts
│   │   ├── auth.service.ts
│   │   ├── layout.service.ts
│   │   ├── notification.service.ts
│   │   ├── project.service.ts
│   │   └── task.service.ts
│   └── core.module.ts             # Imports all core services once
│
├── features/                      # Feature modules (lazy-loaded when needed)
│   ├── analytics/                 # Analytics/Reporting views
│   ├── auth/                      # Auth features
│   │   ├── login/
│   │   ├── profile/
│   │   ├── register/
│   │   └── auth.module.ts
│   ├── calendar/                  # Calendar feature (if implemented)
│   ├── dashboard/                 # Home dashboard after login
│   │   ├── dashboard.component.ts/html/scss
│   │   └── dashboard.module.ts
│   ├── notifications/             # Notification list or bell
│   ├── projects/                  # Project listing and management
│   │   └── projects.component.ts/html/css
│   ├── reports/                   # Report component
│   │   └── reports.component.ts/html/css
│   └── tasks/                     # Task-related features
│       ├── task-list/
│       ├── task-form/
│       └── task-detail/
│
├── shared/                        # Reusable components, directives, pipes
│   ├── components/
│   │   ├── header/
│   │   ├── sidebar/
│   │   └── loading/
│   ├── pipes/
│   │   └── status-color.pipe.ts
│   └── directives/
│
├── app-routing.module.ts          # Central routing module
├── app.component.ts/html          # Root component
└── app.module.ts                  # Root module



this is my fron-end structure