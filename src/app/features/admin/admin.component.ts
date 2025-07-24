// src/app/features/admin/admin.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  isLoading = true;
  users: User[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'createdAt', 'actions'];
  
  // System metrics
  systemMetrics = {
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    systemHealth: 'Good'
  };

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAdminData();
  }

  loadAdminData(): void {
    this.isLoading = true;
    
    // Load users
    this.authService.getUsers().subscribe({
      next: (users) => {
        this.users = users.map(user => ({
          ...user,
          created_at: user.created_at || new Date().toISOString(),
          role: user.role || 'EMPLOYEE'
        })) as User[];
        
        this.updateSystemMetrics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadMockData();
        this.isLoading = false;
      }
    });
  }

  private loadMockData(): void {
    // Mock data for demonstration
    this.users = [
      {
        id: 1,
        name: 'John Manager',
        email: 'john.manager@company.com',
        role: 'MANAGER',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: 'Alice Employee',
        email: 'alice.employee@company.com',
        role: 'EMPLOYEE',
        created_at: '2024-02-01T10:00:00Z'
      },
      {
        id: 3,
        name: 'Bob Developer',
        email: 'bob.dev@company.com',
        role: 'EMPLOYEE',
        created_at: '2024-02-15T10:00:00Z'
      },
      {
        id: 4,
        name: 'Carol Designer',
        email: 'carol.design@company.com',
        role: 'EMPLOYEE',
        created_at: '2024-03-01T10:00:00Z'
      }
    ] as User[];
    
    this.updateSystemMetrics();
  }

  private updateSystemMetrics(): void {
    this.systemMetrics = {
      totalUsers: this.users.length,
      activeUsers: this.users.length, // Assume all are active for demo
      totalTasks: 127, // Mock data
      systemHealth: 'Good'
    };
  }

  changeUserRole(user: User, newRole: string): void {
    // In a real app, this would call an API
    const userIndex = this.users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      this.users[userIndex].role = newRole as any;
      this.snackBar.open(`Role updated for ${user.name}`, 'Close', {
        duration: 3000
      });
    }
  }

  deactivateUser(user: User): void {
    // In a real app, this would call an API
    this.snackBar.open(`User ${user.name} deactivated`, 'Close', {
      duration: 3000
    });
  }

  resetUserPassword(user: User): void {
    // In a real app, this would call an API
    this.snackBar.open(`Password reset email sent to ${user.email}`, 'Close', {
      duration: 3000
    });
  }

  getRoleColor(role: string): string {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'warn';
      case 'MANAGER':
        return 'accent';
      case 'EMPLOYEE':
      default:
        return 'primary';
    }
  }

  getRoleDisplayName(role: string): string {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'Administrator';
      case 'MANAGER':
        return 'Manager';
      case 'EMPLOYEE':
      default:
        return 'Employee';
    }
  }
}