# 🚀 Quick Start Guide

Get your Task Management System up and running in minutes!

## 🎯 Choose Your Setup Method

### Option 1: Automated Setup (Recommended)
```bash
# Clone and run the setup script
git clone <repository-url>
cd task-management-system
./setup.sh
```

### Option 2: Docker Compose (Fastest)
```bash
# Clone the repository
git clone <repository-url>
cd task-management-system

# Start all services
docker-compose up -d

# Initialize database
docker-compose exec backend python run.py --init-db

# Access the app
open http://localhost:4200
```

### Option 3: Manual Setup
```bash
# Frontend setup
npm install
npm start

# Backend setup (in another terminal)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.template .env
python run.py --init-db
python run.py
```

## 🌐 Access Points

After setup, access your application:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health
- **API Info**: http://localhost:5000/api/info

## 🔧 Development Commands

### Frontend
```bash
npm start              # Start development server
npm run build          # Build for production
npm run test           # Run tests
npm run lint           # Lint code
```

### Backend
```bash
npm run backend:start     # Start backend server
npm run backend:init-db   # Initialize database
npm run backend:migrate   # Run migrations
npm run backend:test      # Run tests
```

### Full Stack
```bash
npm run dev            # Start both frontend and backend
npm run docker:up      # Start with Docker
npm run docker:logs    # View Docker logs
```

## 📝 First Steps

1. **Create a user account** at http://localhost:4200/auth/register
2. **Login** with your credentials
3. **Create your first task** from the dashboard
4. **Explore features** like projects, calendar, and reports

## 🛠️ Configuration

### Backend Configuration
Edit `backend/.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/task_management
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
```

### Frontend Configuration
Edit `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  // ... other settings
};
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill processes on ports 4200 or 5000
lsof -ti:4200 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

**Database connection issues:**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View backend logs
docker-compose logs backend
```

**Frontend build errors:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the [API documentation](#) for backend integration
- Explore the [architecture guide](#) for system design details

## 🆘 Need Help?

- Create an issue on GitHub
- Check the troubleshooting section in README.md
- Contact the development team

---

**Happy coding! 🎉**