// src/app/features/admin/admin.component.ts
import { Component, OnInit } from '@angular/core';
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
    private authService: AuthService
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

  changeUserRole(user: User, newRole: string | any): void {
    // Handle both string and event target value
    const roleValue = typeof newRole === 'string' ? newRole : newRole.target?.value || newRole;
    
    // In a real app, this would call an API
    const userIndex = this.users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      this.users[userIndex].role = roleValue as any;
      console.log(`Role updated for ${user.name} to ${roleValue}`);
    }
  }

  deactivateUser(user: User): void {
    // In a real app, this would call an API
    console.log(`User ${user.name} deactivated`);
  }

  resetUserPassword(user: User): void {
    // In a real app, this would call an API
    console.log(`Password reset email sent to ${user.email}`);
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