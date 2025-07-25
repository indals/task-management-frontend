# Flask REST API Structure for Task Management System

This document outlines the expected Flask REST API structure that aligns with the updated Angular frontend.

## Base Configuration

```python
# app.py or __init__.py
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///task_manager.db'
app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app)
```

## API Endpoints Structure

### Authentication Endpoints (`/api/auth`)

```python
# routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    POST /api/auth/login
    Body: {"email": "user@example.com", "password": "password"}
    Response: {"access_token": "jwt_token", "user": {...}}
    """
    pass

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    POST /api/auth/register
    Body: {"name": "John Doe", "email": "user@example.com", "password": "password", "role": "EMPLOYEE"}
    Response: {"message": "User created successfully", "user": {...}}
    """
    pass

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    POST /api/auth/logout
    Response: {"message": "Successfully logged out"}
    """
    pass

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    GET /api/auth/me
    Response: {"data": {...user_data...}}
    """
    pass

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    PUT /api/auth/profile
    Body: {"name": "Updated Name", "email": "new@example.com"}
    Response: {"message": "Profile updated", "user": {...}}
    """
    pass

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """
    POST /api/auth/change-password
    Body: {"current_password": "old", "new_password": "new"}
    Response: {"message": "Password changed successfully"}
    """
    pass
```

### User Management (`/api/users`)

```python
# routes/users.py
from flask import Blueprint

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('', methods=['GET'])
@jwt_required()
def get_users():
    """
    GET /api/users?page=1&limit=10&search=john
    Response: {"data": [...], "pagination": {...}}
    """
    pass

@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """
    GET /api/users/1
    Response: {"data": {...user_data...}}
    """
    pass

@users_bp.route('/search', methods=['GET'])
@jwt_required()
def search_users():
    """
    GET /api/users/search?q=john
    Response: {"data": [...users...]}
    """
    pass
```

### Task Management (`/api/tasks`)

```python
# routes/tasks.py
from flask import Blueprint

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

@tasks_bp.route('', methods=['GET'])
@jwt_required()
def get_tasks():
    """
    GET /api/tasks?status=TODO&priority=HIGH&assignee_id=1&page=1&limit=10
    Response: {"data": [...], "pagination": {...}}
    """
    pass

@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    """
    POST /api/tasks
    Body: {
        "title": "Task Title",
        "description": "Task Description",
        "priority": "HIGH",
        "due_date": "2024-12-31",
        "assignee_id": 1,
        "category_id": 1,
        "tags": ["urgent", "feature"]
    }
    Response: {"data": {...task_data...}}
    """
    pass

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """
    GET /api/tasks/1
    Response: {"data": {...task_with_comments_and_subtasks...}}
    """
    pass

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """
    PUT /api/tasks/1
    Body: {"title": "Updated Title", "status": "IN_PROGRESS"}
    Response: {"data": {...updated_task...}}
    """
    pass

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """
    DELETE /api/tasks/1
    Response: {"message": "Task deleted successfully"}
    """
    pass

@tasks_bp.route('/<int:task_id>/assign', methods=['POST'])
@jwt_required()
def assign_task(task_id):
    """
    POST /api/tasks/1/assign
    Body: {"user_id": 2}
    Response: {"data": {...updated_task...}}
    """
    pass

@tasks_bp.route('/<int:task_id>/status', methods=['PATCH'])
@jwt_required()
def update_task_status(task_id):
    """
    PATCH /api/tasks/1/status
    Body: {"status": "DONE"}
    Response: {"data": {...updated_task...}}
    """
    pass

@tasks_bp.route('/bulk-update', methods=['PATCH'])
@jwt_required()
def bulk_update_tasks():
    """
    PATCH /api/tasks/bulk-update
    Body: {
        "task_ids": [1, 2, 3],
        "updates": {"status": "DONE", "assignee_id": 2}
    }
    Response: {"message": "Tasks updated", "updated_count": 3}
    """
    pass

@tasks_bp.route('/search', methods=['GET'])
@jwt_required()
def search_tasks():
    """
    GET /api/tasks/search?q=search_term&status=TODO
    Response: {"data": [...tasks...]}
    """
    pass

@tasks_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_task_stats():
    """
    GET /api/tasks/stats
    Response: {
        "data": {
            "total_tasks": 100,
            "completed_tasks": 75,
            "overdue_tasks": 5,
            "tasks_by_status": {...},
            "completion_rate": 0.75
        }
    }
    """
    pass
```

### Task Comments (`/api/tasks/{id}/comments`)

```python
@tasks_bp.route('/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(task_id):
    """
    GET /api/tasks/1/comments
    Response: {"data": [...comments...]}
    """
    pass

@tasks_bp.route('/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(task_id):
    """
    POST /api/tasks/1/comments
    Body: {"content": "This is a comment"}
    Response: {"data": {...comment_data...}}
    """
    pass

@tasks_bp.route('/<int:task_id>/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(task_id, comment_id):
    """
    PUT /api/tasks/1/comments/1
    Body: {"content": "Updated comment"}
    Response: {"data": {...updated_comment...}}
    """
    pass

@tasks_bp.route('/<int:task_id>/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(task_id, comment_id):
    """
    DELETE /api/tasks/1/comments/1
    Response: {"message": "Comment deleted"}
    """
    pass
```

### Team Management (`/api/teams`)

```python
# routes/teams.py
from flask import Blueprint

teams_bp = Blueprint('teams', __name__, url_prefix='/api/teams')

@teams_bp.route('', methods=['GET'])
@jwt_required()
def get_teams():
    """
    GET /api/teams?page=1&limit=10
    Response: {"data": [...], "pagination": {...}}
    """
    pass

@teams_bp.route('', methods=['POST'])
@jwt_required()
def create_team():
    """
    POST /api/teams
    Body: {
        "name": "Development Team",
        "description": "Main development team",
        "initial_members": [{"email": "user@example.com", "role": "MEMBER"}]
    }
    Response: {"data": {...team_data...}}
    """
    pass

@teams_bp.route('/<int:team_id>', methods=['GET'])
@jwt_required()
def get_team(team_id):
    """
    GET /api/teams/1
    Response: {"data": {...team_with_members...}}
    """
    pass

@teams_bp.route('/<int:team_id>/members', methods=['GET'])
@jwt_required()
def get_team_members(team_id):
    """
    GET /api/teams/1/members
    Response: {"data": [...members...]}
    """
    pass

@teams_bp.route('/<int:team_id>/members', methods=['POST'])
@jwt_required()
def add_team_member(team_id):
    """
    POST /api/teams/1/members
    Body: {"email": "user@example.com", "role": "MEMBER"}
    Response: {"data": {...invitation_or_member...}}
    """
    pass

@teams_bp.route('/invitations', methods=['GET'])
@jwt_required()
def get_invitations():
    """
    GET /api/teams/invitations?status=PENDING
    Response: {"data": [...invitations...]}
    """
    pass

@teams_bp.route('/invitations/<int:invitation_id>/accept', methods=['POST'])
@jwt_required()
def accept_invitation(invitation_id):
    """
    POST /api/teams/invitations/1/accept
    Response: {"message": "Invitation accepted", "team_member": {...}}
    """
    pass
```

### Categories (`/api/categories`)

```python
# routes/categories.py
from flask import Blueprint

categories_bp = Blueprint('categories', __name__, url_prefix='/api/categories')

@categories_bp.route('', methods=['GET'])
@jwt_required()
def get_categories():
    """
    GET /api/categories?include_inactive=false&parent_only=true
    Response: {"data": [...categories...]}
    """
    pass

@categories_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """
    POST /api/categories
    Body: {
        "name": "Development",
        "description": "Development tasks",
        "color": "#FF6B6B",
        "icon": "code"
    }
    Response: {"data": {...category_data...}}
    """
    pass

@categories_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """
    PUT /api/categories/1
    Body: {"name": "Updated Category", "color": "#4ECDC4"}
    Response: {"data": {...updated_category...}}
    """
    pass
```

### Notifications (`/api/notifications`)

```python
# routes/notifications.py
from flask import Blueprint

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """
    GET /api/notifications?page=1&limit=10&unread_only=true
    Response: {"data": [...], "pagination": {...}}
    """
    pass

@notifications_bp.route('/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    """
    POST /api/notifications/1/read
    Response: {"message": "Notification marked as read"}
    """
    pass

@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """
    GET /api/notifications/unread-count
    Response: {"count": 5}
    """
    pass
```

## Data Models

### User Model
```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('ADMIN', 'MANAGER', 'EMPLOYEE'), default='EMPLOYEE')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Task Model
```python
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Enum('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED'), default='TODO')
    priority = db.Column(db.Enum('LOW', 'MEDIUM', 'HIGH', 'URGENT'), default='MEDIUM')
    due_date = db.Column(db.DateTime)
    start_date = db.Column(db.DateTime)
    completed_date = db.Column(db.DateTime)
    estimated_hours = db.Column(db.Float)
    actual_hours = db.Column(db.Float)
    progress = db.Column(db.Integer, default=0)  # 0-100
    tags = db.Column(db.JSON)  # Array of strings
    is_archived = db.Column(db.Boolean, default=False)
    
    # Foreign Keys
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'))
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    
    # Relationships
    created_by = db.relationship('User', foreign_keys=[created_by_id])
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id])
    project = db.relationship('Project', backref='tasks')
    category = db.relationship('Category', backref='tasks')
    comments = db.relationship('Comment', backref='task', cascade='all, delete-orphan')
    subtasks = db.relationship('Subtask', backref='task', cascade='all, delete-orphan')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Team Model
```python
class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_by = db.relationship('User', backref='created_teams')
    
    members = db.relationship('TeamMember', backref='team', cascade='all, delete-orphan')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TeamMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role = db.Column(db.Enum('OWNER', 'ADMIN', 'MEMBER', 'VIEWER'), default='MEMBER')
    is_active = db.Column(db.Boolean, default=True)
    
    user = db.relationship('User', backref='team_memberships')
    added_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    added_by = db.relationship('User', foreign_keys=[added_by_id])
    
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
```

### Category Model
```python
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7))  # Hex color code
    icon = db.Column(db.String(50))
    is_default = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    order = db.Column(db.Integer, default=0)
    
    parent_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    parent_category = db.relationship('Category', remote_side=[id], backref='subcategories')
    
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_by = db.relationship('User', backref='categories')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

## Error Handling

```python
# utils/error_handlers.py
from flask import jsonify

@app.errorhandler(400)
def bad_request(error):
    return jsonify({
        'error': 'Bad Request',
        'message': str(error),
        'statusCode': 400
    }), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({
        'error': 'Unauthorized',
        'message': 'Authentication required',
        'statusCode': 401
    }), 401

@app.errorhandler(403)
def forbidden(error):
    return jsonify({
        'error': 'Forbidden',
        'message': 'Insufficient permissions',
        'statusCode': 403
    }), 403

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Not Found',
        'message': 'Resource not found',
        'statusCode': 404
    }), 404

@app.errorhandler(422)
def unprocessable_entity(error):
    return jsonify({
        'error': 'Unprocessable Entity',
        'message': 'Validation error',
        'statusCode': 422
    }), 422

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred',
        'statusCode': 500
    }), 500
```

## Response Format

All API responses should follow this consistent format:

### Success Response
```json
{
  "data": {...},
  "message": "Optional success message",
  "success": true
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 100,
    "items_per_page": 10
  },
  "success": true
}
```

### Error Response
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

This structure provides a comprehensive Flask REST API that aligns perfectly with the updated Angular frontend, supporting all the features including task management, team collaboration, categorization, and real-time notifications.