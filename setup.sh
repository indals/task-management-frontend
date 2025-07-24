#!/bin/bash

# Task Management System Setup Script
# This script sets up the development environment for the full-stack application

set -e  # Exit on any error

echo "🚀 Setting up Task Management System Development Environment"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher. Current version: $(node --version)"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.11+ from https://python.org/"
        exit 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker found - Docker setup will be available"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker not found - Docker setup will be skipped"
        DOCKER_AVAILABLE=false
    fi
    
    print_success "Prerequisites check completed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    # Install npm dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    print_success "Frontend setup completed"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Create virtual environment
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install Python dependencies
    print_status "Installing backend dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.template .env
        print_warning "Please edit backend/.env file with your configuration"
    fi
    
    cd ..
    print_success "Backend setup completed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Starting PostgreSQL with Docker..."
        docker-compose up -d postgres
        
        # Wait for PostgreSQL to be ready
        print_status "Waiting for PostgreSQL to be ready..."
        sleep 10
        
        # Initialize database
        print_status "Initializing database..."
        docker-compose exec backend python run.py --init-db
        
        print_success "Database setup completed with Docker"
    else
        print_warning "Docker not available. Please set up PostgreSQL manually:"
        echo "1. Install PostgreSQL"
        echo "2. Create a database named 'task_management'"
        echo "3. Update the DATABASE_URL in backend/.env"
        echo "4. Run: cd backend && python run.py --init-db"
    fi
}

# Docker setup
setup_docker() {
    if [ "$DOCKER_AVAILABLE" = true ]; then
        print_status "Setting up Docker environment..."
        
        # Build Docker images
        print_status "Building Docker images..."
        docker-compose build
        
        # Start all services
        print_status "Starting all services..."
        docker-compose up -d
        
        # Wait for services to be ready
        print_status "Waiting for services to be ready..."
        sleep 15
        
        # Initialize database
        print_status "Initializing database..."
        docker-compose exec backend python run.py --init-db
        
        print_success "Docker setup completed"
        print_status "Services running:"
        echo "  - Frontend: http://localhost:4200"
        echo "  - Backend API: http://localhost:5000"
        echo "  - PostgreSQL: localhost:5432"
        echo "  - Redis: localhost:6379"
    fi
}

# Main setup function
main() {
    echo "Select setup option:"
    echo "1) Manual setup (Node.js + Python)"
    echo "2) Docker setup (recommended)"
    echo "3) Full setup (both manual and Docker)"
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            check_prerequisites
            setup_frontend
            setup_backend
            print_warning "Please set up PostgreSQL manually and run database initialization"
            ;;
        2)
            if [ "$DOCKER_AVAILABLE" = true ]; then
                setup_docker
            else
                print_error "Docker is not available. Please install Docker first."
                exit 1
            fi
            ;;
        3)
            check_prerequisites
            setup_frontend
            setup_backend
            setup_docker
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "🎉 Setup completed successfully!"
    echo ""
    echo "📚 Next steps:"
    echo "1. Review and update configuration files:"
    echo "   - backend/.env (database, secrets)"
    echo "   - src/environments/environment.ts (API URL)"
    echo ""
    echo "2. Start development:"
    if [ "$choice" = "2" ] || [ "$choice" = "3" ]; then
        echo "   - Docker: docker-compose up"
        echo "   - Check logs: docker-compose logs -f"
    fi
    if [ "$choice" = "1" ] || [ "$choice" = "3" ]; then
        echo "   - Manual: npm run dev (starts both frontend and backend)"
        echo "   - Frontend only: npm start"
        echo "   - Backend only: npm run backend:start"
    fi
    echo ""
    echo "3. Access the application:"
    echo "   - Frontend: http://localhost:4200"
    echo "   - Backend API: http://localhost:5000"
    echo "   - API Health: http://localhost:5000/api/health"
    echo ""
    echo "📖 For more information, see README.md"
}

# Run main function
main