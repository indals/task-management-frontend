# Task Management System

A full-stack task management application built with Angular (frontend) and Flask (backend), featuring real-time updates, user authentication, and comprehensive task management capabilities.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular       │    │   Flask API     │    │   PostgreSQL    │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│   (Port 4200)   │    │   (Port 5000)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                        ┌─────────────────┐
                        │     Redis       │
                        │   (Port 6379)   │
                        └─────────────────┘
```

## ✨ Features

### Frontend (Angular)
- 🎨 Modern, responsive UI with Angular Material
- 🔐 JWT-based authentication
- 📊 Dashboard with analytics and charts
- 📋 Comprehensive task management
- 🔔 Real-time notifications
- 📅 Calendar view for tasks
- 🌙 Dark/Light theme support
- 🔍 Advanced filtering and search
- 📱 Mobile-responsive design

### Backend (Flask)
- 🚀 RESTful API with Flask
- 🔒 JWT authentication and authorization
- 🗄️ PostgreSQL database with SQLAlchemy ORM
- 🔄 Database migrations with Flask-Migrate
- 📝 Comprehensive logging
- 🛡️ CORS configuration
- 🏥 Health check endpoints
- 📊 Analytics and reporting
- 🔧 Environment-based configuration

## 🛠️ Technology Stack

### Frontend
- **Framework**: Angular 18
- **UI Library**: Angular Material
- **Charts**: Chart.js
- **Authentication**: @auth0/angular-jwt
- **HTTP Client**: Angular HttpClient
- **Styling**: SCSS

### Backend
- **Framework**: Flask
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: Flask-JWT-Extended
- **Migrations**: Flask-Migrate
- **CORS**: Flask-CORS
- **Caching**: Redis (optional)

### DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Process Manager**: Gunicorn (production)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 13+
- Docker & Docker Compose (optional)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Initialize the database**
   ```bash
   docker-compose exec backend python run.py --init-db
   ```

4. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/api/health

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.template .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python run.py --init-db
   ```

6. **Start the backend server**
   ```bash
   python run.py
   ```

#### Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Task Management Endpoints
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task by ID
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/assign` - Assign task to user

### Health Check Endpoints
- `GET /api/health` - General health check
- `GET /api/health/db` - Database health check
- `GET /api/info` - API information

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
CORS_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  // ... other configuration
};
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Frontend Tests
```bash
npm test
```

### E2E Tests
```bash
npm run e2e
```

## 📦 Deployment

### Production with Docker
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Production Deployment

#### Backend
```bash
# Install production dependencies
pip install -r requirements.txt

# Set production environment
export FLASK_ENV=production

# Run with Gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 wsgi:app
```

#### Frontend
```bash
# Build for production
npm run build

# Serve with nginx or any web server
```

## 🔍 Monitoring & Logging

### Health Checks
- Backend health: `GET /api/health`
- Database health: `GET /api/health/db`

### Logs
- Backend logs: `backend/logs/app.log`
- Docker logs: `docker-compose logs [service-name]`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **CORS errors**
   - Check CORS_ORIGINS in backend .env
   - Verify frontend URL is included

3. **Port conflicts**
   - Change ports in docker-compose.yml
   - Update environment configurations

### Support
For support, please open an issue on GitHub or contact the development team.

---

## 🚀 Recent Improvements

This version includes several enhancements:

- ✅ Enhanced configuration management with environment variables
- ✅ Improved CORS configuration for better security
- ✅ Better error handling and logging
- ✅ Docker containerization for easy deployment
- ✅ Health check endpoints for monitoring
- ✅ Database migration support
- ✅ Production-ready setup with Gunicorn and Nginx
- ✅ Comprehensive API documentation
- ✅ Environment-specific configurations
- ✅ Enhanced frontend service architecture
