# 📋 Task Management System - Angular Frontend

A comprehensive, enterprise-grade Task Management System built with Angular 18, featuring role-based access control, real-time notifications, analytics, and modern UI/UX design.

## 🚀 Features

### 👥 User Roles & Access Control
- **Manager** - Full access to projects, analytics, team management, and task assignment
- **Employee** - Access to assigned tasks, personal dashboard, and notifications
- **Admin** - System administration, user management, and full system access

### 🎯 Core Functionality
- **Authentication & Authorization** - JWT-based authentication with role-based route protection
- **Task Management** - Create, assign, update, and track tasks with priorities and deadlines
- **Project Organization** - Group tasks into projects with progress tracking
- **Real-time Notifications** - Instant notifications for task assignments and status changes
- **Analytics Dashboard** - Comprehensive metrics and performance insights
- **Comments & Collaboration** - Task-level comments and team collaboration
- **File Attachments** - Support for task-related file uploads
- **Advanced Filtering** - Filter tasks by status, priority, assignee, and date ranges

### 📊 Analytics & Reporting
- **Performance Metrics** - Team and individual performance tracking
- **Task Analytics** - Completion rates, time tracking, and productivity insights
- **Visual Charts** - Interactive charts using Chart.js for data visualization
- **Export Capabilities** - Export reports and analytics data

### 🎨 Modern UI/UX
- **Angular Material Design** - Consistent, accessible, and beautiful UI components
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes** - User preference-based theming
- **Progressive Web App** - PWA capabilities for offline functionality

## 🏗️ Architecture

The application follows Angular best practices with a modular, scalable architecture:

```
src/app/
├── 📁 core/                          # Singleton services, guards, interceptors
│   ├── 📁 constants/                 # Application constants and configuration
│   ├── 📁 guards/                    # Authentication and role-based guards
│   ├── 📁 interceptors/             # HTTP interceptors (JWT, error handling)
│   ├── 📁 interfaces/               # TypeScript interfaces for API
│   ├── 📁 models/                   # Domain models and DTOs
│   ├── 📁 services/                 # Business logic services
│   └── 📄 core.module.ts            # Core module with forRoot pattern
│
├── 📁 shared/                       # Reusable components and utilities
│   ├── 📁 components/               # Shared UI components
│   ├── 📁 directives/               # Custom directives
│   ├── 📁 pipes/                    # Custom pipes
│   ├── 📄 material.module.ts        # Angular Material imports
│   └── 📄 shared.module.ts          # Shared module exports
│
├── 📁 features/                     # Feature modules (lazy loaded)
│   ├── 📁 auth/                     # Authentication & user management
│   ├── 📁 dashboard/                # Main dashboard with metrics
│   ├── 📁 tasks/                    # Task management features
│   ├── 📁 projects/                 # Project management (Manager only)
│   ├── 📁 analytics/                # Advanced analytics (Manager only)
│   ├── 📁 notifications/            # Notification center
│   ├── 📁 reports/                  # Reporting features (Manager only)
│   └── 📁 admin/                    # Admin panel (Admin only)
│
└── 📁 environments/                 # Environment configurations
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (18.x or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Update `src/environments/environment.ts` with your backend API configuration:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api',  // Your backend API URL
     appName: 'Task Manager',
     version: '1.0.0'
   };
   ```

4. **Run the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:4200`

### Production Build

```bash
npm run build
# or
ng build --configuration production
```

## 🔧 Configuration

### Backend API Requirements

The frontend expects a REST API with the following endpoints:

**Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

**Tasks:**
- `GET /api/tasks` - Get tasks with filtering
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

**Projects:**
- `GET /api/projects` - Get projects list
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project

**Notifications:**
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read

### JWT Token Management

The application uses JWT tokens stored in localStorage. Configure your backend to:
- Return JWT tokens in the `access_token` field
- Include user information in the login response
- Validate tokens on protected endpoints

## 🎯 Usage Guidelines

### For Managers
1. **Dashboard** - Monitor team performance and project progress
2. **Projects** - Create and manage projects, assign tasks to team members
3. **Analytics** - View detailed performance metrics and reports
4. **Team Management** - Assign tasks, monitor progress, and provide feedback

### For Employees
1. **Task Management** - View assigned tasks, update status, and add comments
2. **Personal Dashboard** - Track personal productivity and deadlines
3. **Notifications** - Stay updated on new assignments and project changes

### For Administrators
1. **User Management** - Create users, manage roles, and system permissions
2. **System Monitoring** - Monitor system health and user activity
3. **Configuration** - Manage system settings and configurations

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Route and feature protection based on user roles
- **HTTP Interceptors** - Automatic token attachment and error handling
- **Input Validation** - Client-side validation with Angular Reactive Forms
- **XSS Protection** - Angular's built-in sanitization
- **HTTPS Ready** - Production-ready HTTPS configuration

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Run tests with coverage
npm run test:coverage
```

## 📱 Progressive Web App

The application includes PWA capabilities:
- **Offline Support** - Basic offline functionality
- **App Installation** - Install as a native app
- **Push Notifications** - Browser-based notifications
- **Responsive Design** - Mobile-optimized interface

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/task-manager-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables

Set the following environment variables for production:

- `API_URL` - Backend API URL
- `APP_NAME` - Application name
- `VERSION` - Application version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Development Guidelines

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Implement proper error handling
- Write unit tests for new features
- Use meaningful component and service names

### Performance Best Practices
- Lazy load feature modules
- Use OnPush change detection strategy
- Implement virtual scrolling for large lists
- Optimize bundle size with tree shaking
- Use trackBy functions in *ngFor loops

### Accessibility
- Follow WCAG 2.1 guidelines
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation support
- Test with screen readers

## 🐛 Troubleshooting

### Common Issues

1. **Module not found errors**
   - Ensure all dependencies are installed: `npm install`
   - Check import paths and barrel exports

2. **Authentication issues**
   - Verify backend API endpoints
   - Check JWT token format and expiration
   - Ensure CORS is configured on backend

3. **Build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Angular and TypeScript versions compatibility

4. **Performance issues**
   - Enable production mode
   - Check for memory leaks in subscriptions
   - Optimize change detection with OnPush

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Angular Team** - For the amazing framework
- **Angular Material** - For the beautiful UI components
- **Chart.js** - For powerful data visualization
- **Community Contributors** - For continuous improvements and feedback

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the [documentation](docs/)
- Contact the development team

---

**Built with ❤️ using Angular 18 and Angular Material**
