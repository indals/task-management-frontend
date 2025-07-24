import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

// Import existing models
import { User } from '../../core/models/user.model';
import { Task } from '../../core/models/task.model';
import { Notification } from '../../core/models/notification.model';
import { UserPerformance, TaskDistribution } from '../../core/models/analytics.model';
import { TaskStatus, TaskPriority } from '../../core/models/enums';

// Register Chart.js components
Chart.register(...registerables);

interface TaskStat {
  label: string;
  value: number;
  iconClass: string;
}

interface TaskCompletionData {
  user_id: number;
  period: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  pending_tasks: number;
  in_progress_tasks: number;
  cancelled_tasks: number;
}

interface TaskStatusDistribution {
  total_tasks: number;
  status_distribution: {
    [key: string]: {
      count: number;
      percentage: number;
    };
  };
}

interface TaskPriorityDistribution {
  total_tasks: number;
  priority_distribution: {
    [key: string]: {
      count: number;
      percentage: number;
    };
  };
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly API_BASE_URL = 'http://127.0.0.1:5000/api';
  
  isLoading = true;
  
  // API Data
  tasks: Task[] = [];
  currentUser: User | null = null;
  taskCompletionData: TaskCompletionData | null = null;
  statusDistribution: TaskStatusDistribution | null = null;
  priorityDistribution: TaskPriorityDistribution | null = null;
  notifications: Notification[] = [];
  
  // Computed Data
  taskStats: TaskStat[] = [];
  tasksDueSoon: any[] = [];
  recentActivities: any[] = [];
  unreadNotifications = 0;
  
  // Charts
  statusChart: Chart | null = null;
  priorityChart: Chart | null = null;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    if (this.priorityChart) {
      this.priorityChart.destroy();
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Get current user first
    this.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        
        // Load all dashboard data in parallel
        forkJoin({
          tasks: this.getTasks(),
          taskCompletion: this.getTaskCompletion(),
          statusDistribution: this.getTaskStatusDistribution(),
          priorityDistribution: this.getTaskPriorityDistribution(),
          notifications: this.getNotifications()
        }).pipe(
          catchError(error => {
            console.error('Error loading dashboard data:', error);
            // Return empty data on error to prevent complete failure
            return of({
              tasks: [],
              taskCompletion: null,
              statusDistribution: null,
              priorityDistribution: null,
              notifications: []
            });
          }),
          finalize(() => {
            this.isLoading = false;
          })
        ).subscribe({
          next: (data) => {
            this.tasks = data.tasks;
            this.taskCompletionData = data.taskCompletion;
            this.statusDistribution = data.statusDistribution;
            this.priorityDistribution = data.priorityDistribution;
            this.notifications = data.notifications;
            
            this.processLoadedData();
          }
        });
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.isLoading = false;
        // Use fallback user data
        this.currentUser = this.authService.getCurrentUser();
        this.loadFallbackData();
      }
    });
  }

  private getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching current user:', error);
        // Return cached user as fallback
        const cachedUser = this.authService.getCurrentUser();
        return of(cachedUser || {
          id: 0,
          name: 'User',
          email: '',
          role: 'user'
        } as User);
      })
    );
  }

  private getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_BASE_URL}/tasks`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching tasks:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  private getTaskCompletion(): Observable<TaskCompletionData | null> {
    return this.http.get<TaskCompletionData>(`${this.API_BASE_URL}/analytics/task-completion`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching task completion data:', error);
        return of(null);
      })
    );
  }

  private getTaskStatusDistribution(): Observable<TaskStatusDistribution | null> {
    return this.http.get<TaskStatusDistribution>(`${this.API_BASE_URL}/analytics/task-status-distribution`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching status distribution:', error);
        return of(null);
      })
    );
  }

  private getTaskPriorityDistribution(): Observable<TaskPriorityDistribution | null> {
    return this.http.get<TaskPriorityDistribution>(`${this.API_BASE_URL}/analytics/task-priority-distribution`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching priority distribution:', error);
        return of(null);
      })
    );
  }

  private getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.API_BASE_URL}/notifications`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching notifications:', error);
        return of([]);
      })
    );
  }

  private processLoadedData(): void {
    this.calculateTaskStats();
    this.filterTasksDueSoon();
    this.generateRecentActivities();
    this.calculateUnreadNotifications();
    this.initCharts();
  }

  private loadFallbackData(): void {
    // Use static data as fallback
    this.tasks = [
      {
        id: 1,
        title: 'Sample Task 1',
        description: 'Sample description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        due_date: '2025-03-30T18:00:00',
        assigned_to: null,
        created_by: { id: 1, name: 'Sample User', email: 'user@example.com' } as User,
        created_at: '2025-03-20T10:00:00',
        updated_at: '2025-03-20T10:00:00',
        subtasks: []
      },
      {
        id: 2,
        title: 'Sample Task 2',
        description: 'Sample description',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.MEDIUM,
        due_date: '2025-03-25T18:00:00',
        assigned_to: null,
        created_by: { id: 1, name: 'Sample User', email: 'user@example.com' } as User,
        created_at: '2025-03-18T10:00:00',
        updated_at: '2025-03-22T10:00:00',
        subtasks: []
      }
    ] as Task[];
    
    this.processLoadedData();
  }

  calculateTaskStats(): void {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;

    if (this.taskCompletionData) {
      // Use API data if available
      total = this.taskCompletionData.total_tasks;
      completed = this.taskCompletionData.completed_tasks;
      inProgress = this.taskCompletionData.in_progress_tasks;
      // Calculate overdue from tasks array
      overdue = this.tasks.filter(task => {
        if (!task.due_date && !task.dueDate) return false;
        const dueDate = new Date(task.due_date || task.dueDate || '');
        return dueDate < new Date() && task.status !== TaskStatus.COMPLETED;
      }).length;
    } else {
      // Fallback to calculating from tasks array
      total = this.tasks.length;
      completed = this.tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
      inProgress = this.tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
      overdue = this.tasks.filter(task => {
        if (!task.due_date && !task.dueDate) return false;
        const dueDate = new Date(task.due_date || task.dueDate || '');
        return dueDate < new Date() && task.status !== TaskStatus.COMPLETED;
      }).length;
    }

    this.taskStats = [
      { label: 'Total Tasks', value: total, iconClass: 'fas fa-tasks' },
      { label: 'In Progress', value: inProgress, iconClass: 'fas fa-spinner' },
      { label: 'Completed', value: completed, iconClass: 'fas fa-check-circle' },
      { label: 'Overdue', value: overdue, iconClass: 'fas fa-exclamation-circle' }
    ];
  }

  filterTasksDueSoon(): void {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    this.tasksDueSoon = this.tasks
      .filter(task => {
        const dueDate = task.due_date || task.dueDate;
        if (!dueDate) return false;
        const due = new Date(dueDate);
        return due >= today && due <= nextWeek && task.status !== TaskStatus.COMPLETED;
      })
      .map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        dueDate: this.formatDate(task.due_date || task.dueDate || task.created_at || task.createdAt || '')
      }))
      .slice(0, 5);
  }

  private generateRecentActivities(): void {
    // Generate activities from recent tasks and notifications
    const activities: any[] = [];

    // Add recent task activities
    const recentTasks = this.tasks
      .sort((a, b) => new Date(b.updated_at || b.updatedAt || b.created_at || b.createdAt || '').getTime() - 
                     new Date(a.updated_at || a.updatedAt || a.created_at || a.createdAt || '').getTime())
      .slice(0, 3);

    recentTasks.forEach(task => {
      let description = '';
      let icon = 'fas fa-tasks';

      switch (task.status) {
        case TaskStatus.COMPLETED:
          description = `Completed task: ${task.title}`;
          icon = 'fas fa-check-circle';
          break;
        case TaskStatus.IN_PROGRESS:
          description = `Started working on: ${task.title}`;
          icon = 'fas fa-play-circle';
          break;
        case TaskStatus.PENDING:
          description = `Task assigned: ${task.title}`;
          icon = 'fas fa-plus-circle';
          break;
        default:
          description = `Task updated: ${task.title}`;
      }

      activities.push({
        description,
        timestamp: this.formatDate(task.updated_at || task.updatedAt || task.created_at || task.createdAt || ''),
        icon
      });
    });

    // Add recent notifications
    const recentNotifications = this.notifications
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);

    recentNotifications.forEach(notification => {
      activities.push({
        description: notification.message,
        timestamp: this.formatDate(notification.created_at),
        icon: 'fas fa-bell'
      });
    });

    this.recentActivities = activities.slice(0, 5);

    // Fallback if no activities
    if (this.recentActivities.length === 0) {
      this.recentActivities = [
        {
          description: 'Welcome to your dashboard!',
          timestamp: this.formatDate(new Date().toISOString()),
          icon: 'fas fa-hand-wave'
        }
      ];
    }
  }

  private calculateUnreadNotifications(): void {
    this.unreadNotifications = this.notifications.filter(n => !n.read).length;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  initCharts(): void {
    setTimeout(() => {
      this.initStatusChart();
      this.initPriorityChart();
    }, 0);
  }

  initStatusChart(): void {
    console.log('Initializing status chart with data:', this.statusDistribution);
    let statusCounts: { [key: string]: number } = {
      'PENDING': 10,
      'IN_PROGRESS': 20,
      'COMPLETED': 20,
      'CANCELLED': 0
    };
    console.log('statusDistribution:', this.statusDistribution);

  if (
    this.statusDistribution && 
    this.statusDistribution.status_distribution &&
    typeof this.statusDistribution.status_distribution === 'object'
  ) {
    Object.keys(this.statusDistribution.status_distribution).forEach(status => {
      statusCounts[status] = this.statusDistribution!.status_distribution[status].count;
    });
  } else {
    // Fallback to calculating from tasks
    this.tasks.forEach(task => {
      if (task.status in statusCounts) {
        statusCounts[task.status]++;
      }
    });
  }



    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (ctx) {
      this.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
          datasets: [{
            data: [
              statusCounts[TaskStatus.PENDING],
              statusCounts[TaskStatus.IN_PROGRESS],
              statusCounts[TaskStatus.COMPLETED],
              statusCounts[TaskStatus.CANCELLED]
            ],
            backgroundColor: ['#e3f2fd', '#fff8e1', '#e8f5e9', '#ffebee'],
            borderColor: ['#1976d2', '#ff8f00', '#388e3c', '#d32f2f'],
            borderWidth: 1
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
    console.log('Status chart initialized:', this.statusChart);
  }

  initPriorityChart(): void {
    let priorityCounts: { [key: string]: number } = {
      'LOW': 0,
      'MEDIUM': 0,
      'HIGH': 0
    };

    if (this.priorityDistribution) {
      // Use API data
      Object.keys(this.priorityDistribution.priority_distribution).forEach(priority => {
        priorityCounts[priority] = this.priorityDistribution!.priority_distribution[priority].count;
      });
    } else {
      // Fallback to calculating from tasks
      this.tasks.forEach(task => {
        if (task.priority in priorityCounts) {
          priorityCounts[task.priority]++;
        }
      });
    }

    const ctx = document.getElementById('priorityChart') as HTMLCanvasElement;
    if (ctx) {
      this.priorityChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Low', 'Medium', 'High'],
          datasets: [{
            data: [
              priorityCounts[TaskPriority.LOW],
              priorityCounts[TaskPriority.MEDIUM],
              priorityCounts[TaskPriority.HIGH]
            ],
            backgroundColor: ['#e8f5e9', '#fff8e1', '#ffebee'],
            borderColor: ['#388e3c', '#ff8f00', '#d32f2f'],
            borderWidth: 1
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  navigateToTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  createNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  viewAllTasks(): void {
    this.router.navigate(['/tasks']);
  }

  // Method to refresh dashboard data
  refreshDashboard(): void {
    this.loadDashboardData();
  }
}