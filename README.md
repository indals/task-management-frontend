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










// Project structure guide
// app/
// ├── core/
// │   ├── models/
// │   │   ├── task.model.ts
// │   │   ├── user.model.ts
// │   │   ├── notification.model.ts
// │   │   └── enums.ts
// │   ├── services/
// │   │   ├── auth.service.ts
// │   │   ├── task.service.ts
// │   │   ├── notification.service.ts
// │   │   └── analytics.service.ts
// │   ├── interceptors/
// │   │   ├── auth.interceptor.ts
// │   │   └── error.interceptor.ts
// │   └── guards/
// │       └── auth.guard.ts
// ├── shared/
// │   ├── components/
// │   │   ├── header/
// │   │   ├── sidebar/
// │   │   └── loading/
// │   ├── pipes/
// │   │   └── status-color.pipe.ts
// │   └── directives/
// ├── features/
// │   ├── auth/
// │   │   ├── login/
// │   │   ├── register/
// │   │   └── profile/
// │   ├── dashboard/
// │   ├── tasks/
// │   │   ├── task-list/
// │   │   ├── task-form/
// │   │   └── task-detail/
// │   └── notifications/
// └── app.module.ts


this is my fron-end structure