# Task Management System - Frontend

A modern, scalable Angular application for task and project management with role-based access control.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role management (Admin, Manager, Employee)
- **Task Management**: Create, assign, track, and manage tasks with priorities and due dates
- **Project Management**: Organize tasks within projects
- **Dashboard Analytics**: Visual insights into task completion and team performance
- **Real-time Notifications**: Stay updated on task changes and assignments
- **Calendar Integration**: View tasks and deadlines in calendar format
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

This project follows Angular best practices with a clean, modular architecture:

```
src/app/
├── core/                          # Singleton services and app-wide utilities
│   ├── constants/                 # Application constants
│   ├── guards/                    # Route guards (auth protection)
│   ├── interceptors/              # HTTP interceptors (JWT, error handling)
│   ├── models/                    # TypeScript interfaces and enums
│   ├── services/                  # Core business logic services
│   ├── utils/                     # Utility functions
│   └── index.ts                   # Barrel exports
│
├── shared/                        # Reusable components and utilities
│   ├── components/
│   │   ├── layout/                # Header, sidebar, loading components
│   │   └── ui/                    # Reusable UI components (button, card, etc.)
│   ├── directives/                # Shared directives
│   ├── pipes/                     # Shared pipes
│   └── index.ts                   # Barrel exports
│
├── features/                      # Feature modules (lazy-loaded)
│   ├── auth/                      # Authentication (login, register, profile)
│   ├── dashboard/                 # Main dashboard with analytics
│   ├── tasks/                     # Task management
│   ├── projects/                  # Project management
│   ├── calendar/                  # Calendar view
│   ├── reports/                   # Reporting and analytics
│   └── notifications/             # Notification management
│
└── environments/                  # Environment configurations
```

## 🛠️ Technology Stack

- **Angular 18.2** - Modern Angular framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming with observables
- **SCSS** - Advanced CSS with variables and mixins
- **Chart.js** - Data visualization for analytics
- **JWT** - JSON Web Token authentication

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

## 🚦 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update `src/environments/environment.ts` with your API URL
   - Ensure backend API is running on the configured URL

4. **Start development server**
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`

## 🔧 Available Scripts

- `ng serve` - Start development server
- `ng build` - Build for production
- `ng test` - Run unit tests
- `ng lint` - Run linting
- `ng generate` - Generate new components/services/etc.

## 🏃‍♂️ Development Workflow

### Creating New Features

1. **Generate feature module**
   ```bash
   ng generate module features/feature-name --routing
   ```

2. **Add components to feature**
   ```bash
   ng generate component features/feature-name/component-name
   ```

3. **Update routing and lazy loading**

### Adding Shared Components

1. **Generate in shared/components**
   ```bash
   ng generate component shared/components/component-name
   ```

2. **Export in shared module and barrel files**

### Code Style Guidelines

- Use TypeScript strict mode
- Follow Angular style guide
- Use barrel exports (`index.ts`) for clean imports
- Document public APIs with JSDoc comments
- Use meaningful variable and function names
- Keep components focused and under 300 lines

## 📁 Project Structure Details

### Core Module
- **Singleton services**: Authentication, task management, notifications
- **Guards**: Route protection and access control
- **Interceptors**: JWT token attachment, error handling
- **Models**: TypeScript interfaces and enums for type safety
- **Utils**: Helper functions for common operations

### Shared Module
- **Layout components**: Header, sidebar, navigation
- **UI components**: Reusable buttons, cards, forms
- **Pipes**: Data transformation (date formatting, status colors)
- **Directives**: Custom behavior (click outside, auto-focus)

### Feature Modules
- **Lazy-loaded**: Improves initial load time
- **Self-contained**: Each feature has its own routing and components
- **Modular**: Easy to add, remove, or modify features

## 🔒 Security

- JWT token-based authentication
- Route guards for protected pages
- HTTP interceptors for automatic token attachment
- Role-based access control
- Input validation and sanitization

## 🧪 Testing

```bash
# Run unit tests
ng test

# Run tests with coverage
ng test --code-coverage

# Run tests in CI mode
ng test --watch=false --browsers=ChromeHeadless
```

## 📦 Building for Production

```bash
# Build for production
ng build --configuration production

# Analyze bundle size
ng build --stats-json
npx webpack-bundle-analyzer dist/task-manager-frontend/stats.json
```

## 🐛 Troubleshooting

### Common Issues

1. **Module not found errors**: Check barrel exports in `index.ts` files
2. **CORS issues**: Ensure backend allows frontend origin
3. **Authentication issues**: Verify JWT token format and expiration
4. **Build errors**: Check TypeScript strict mode compliance

### Performance Optimization

- Lazy loading for feature modules
- OnPush change detection where appropriate
- Tree shaking with barrel exports
- Optimize bundle size with production builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues, please contact the development team or create an issue in the repository.




---

## 📊 Project Metrics

- **Total Components**: ~25+ reusable components
- **Feature Modules**: 7 lazy-loaded modules
- **Code Coverage**: Target 80%+
- **Bundle Size**: Optimized for production
- **Performance**: Lighthouse score 90+

---

*This documentation reflects the current refactored structure following Angular best practices and modern development standards.*