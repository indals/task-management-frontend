import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { ProjectService } from '../../core/services/project.service';
import { NotificationService } from '../../core/services/notification.service';
import { EnumService } from '../../core/services/enum.service';
import { User, Task, Project } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  recentTasks: Task[] = [];
  recentProjects: Project[] = [];
  overdueTasksCount = 0;
  inProgressTasksCount = 0;
  completedTasksCount = 0;
  totalProjectsCount = 0;
  unreadNotificationsCount = 0;
  
  isLoading = false;
  error: string | null = null;

  // Chart data (mock data for now)
  taskCompletionData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Tasks Completed',
      data: [3, 5, 2, 8, 4, 6, 7],
      backgroundColor: 'rgba(102, 126, 234, 0.2)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2,
      fill: true
    }]
  };

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private notificationService: NotificationService,
    private enumService: EnumService
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Notifications count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadNotificationsCount = count;
      });
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    // Load recent tasks
    this.taskService.getTasks({ page: 1, per_page: 5, sort_by: 'created_at', sort_order: 'desc' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {

          this.recentTasks = response.data;
          console.log('Recent tasks loaded:', this.recentTasks);
        },
        error: (error) => {
          console.error('Error loading recent tasks:', error);
          this.error = 'Failed to load recent tasks';
        }
      });

    // Load recent projects
    this.projectService.getRecentProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (projects) => {
          this.recentProjects = projects;
        },
        error: (error) => {
          console.error('Error loading recent projects:', error);
          this.error = 'Failed to load recent projects';
        }
      });

    // Load task statistics
    this.loadTaskStatistics();
    
    this.isLoading = false;
  }

  private loadTaskStatistics(): void {
    // Load overdue tasks
    this.taskService.getOverdueTasks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.overdueTasksCount = tasks.length;
        },
        error: (error) => {
          console.error('Error loading overdue tasks:', error);
        }
      });

    // Load tasks by status
    this.taskService.getTasksByStatus('IN_PROGRESS')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.inProgressTasksCount = tasks.length;
        },
        error: (error) => {
          console.error('Error loading in-progress tasks:', error);
        }
      });

    this.taskService.getTasksByStatus('DONE')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.completedTasksCount = tasks.length;
        },
        error: (error) => {
          console.error('Error loading completed tasks:', error);
        }
      });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  onCreateTask(): void {
    // Navigate to create task
    console.log('Create task clicked');
  }

  onCreateProject(): void {
    // Navigate to create project
    console.log('Create project clicked');
  }

  onViewAllTasks(): void {
    // Navigate to tasks list
    console.log('View all tasks clicked');
  }

  onViewAllProjects(): void {
    // Navigate to projects list
    console.log('View all projects clicked');
  }

  onRefreshData(): void {
    this.loadDashboardData();
  }

  getTaskStatusLabel(status: string): string {
    return this.enumService.getTaskStatusLabel(status);
  }

  getTaskStatusColor(status: string): string {
    return this.enumService.getTaskStatusColor(status);
  }

  getTaskPriorityLabel(priority: string): string {
    return this.enumService.getTaskPriorityLabel(priority);
  }

  getTaskPriorityColor(priority: string): string {
    return this.enumService.getTaskPriorityColor(priority);
  }

  getProjectStatusLabel(status: string): string {
    return this.enumService.getProjectStatusLabel(status);
  }

  getProjectStatusColor(status: string): string {
    return this.enumService.getProjectStatusColor(status);
  }
}