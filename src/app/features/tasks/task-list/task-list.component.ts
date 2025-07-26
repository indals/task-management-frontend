import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filterStatus: string = 'all';
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
  
  // Add view mode and columns for different layouts
  viewMode: 'list' | 'grid' | 'kanban' = 'list';
  
  // Define status columns for kanban view
  statusColumns = [
    { status: 'PENDING', label: 'Pending', color: '#fbbf24' },
    { status: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
    { status: 'COMPLETED', label: 'Completed', color: '#10b981' },
    { status: 'CANCELLED', label: 'Cancelled', color: '#ef4444' }
  ];
  
  statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  constructor(
    private taskService: TaskService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Performance optimization
  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }

  // Get tasks by status for kanban view
  getTasksByStatus(status: string): Task[] {
    return this.filteredTasks.filter(task => task.status === status);
  }

loadTasks(): void {
  this.isLoading = true;
  this.errorMessage = null;

  const userId = JSON.parse(localStorage.getItem('user-info') || '{}')?.id;

  if (!userId) {
    this.errorMessage = 'User ID not found! Please log in again.';
    this.isLoading = false;
    return;
  }

  this.taskService.getAllTasks({ created_by: userId })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (tasks) => {
        debugger
        this.tasks = Array.isArray(tasks) ? tasks : [tasks];
        this.applyFilters();
      },
      error: (error) => {
        debugger
        console.error('Error loading tasks:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.tasks = [];
        this.applyFilters();
      },
      complete: () => {
        this.isLoading = false;
        debugger
      }
    });
}

  
  refreshTasks(): void {
    this.loadTasks();
  }

  applyFilters(): void {
    if (!Array.isArray(this.tasks)) {
      console.error('Tasks is not an array:', this.tasks);
      this.filteredTasks = [];
      return;
    }

    this.filteredTasks = this.tasks.filter(task => {
      const matchesStatus =
        this.filterStatus === 'all' ||
        (task.status && task.status.toLowerCase() === this.filterStatus.toLowerCase());

      const matchesSearch =
        !this.searchTerm ||
        (task.title && task.title.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  }

  onStatusFilterChange(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  viewTaskDetails(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  createNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  deleteTask(taskId: number, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.applyFilters();
          },
          error: (error) => {
            this.errorMessage = this.getErrorMessage(error);
          }
        });
    }
  }

  // Helper methods for template
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      case 'BACKLOG': return 'Backlog';
      case 'TODO': return 'To Do';
      case 'IN_REVIEW': return 'In Review';
      case 'TESTING': return 'Testing';
      case 'BLOCKED': return 'Blocked';
      case 'DONE': return 'Done';
      case 'DEPLOYED': return 'Deployed';
      default: return status;
    }
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return 'Critical';
      case 'HIGH': return 'High';
      case 'MEDIUM': return 'Medium';
      case 'LOW': return 'Low';
      default: return priority;
    }
  }

  // Set view mode
  setViewMode(mode: 'list' | 'grid' | 'kanban'): void {
    this.viewMode = mode;
  }

  // Clear all filters
  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.applyFilters();
  }

  // Get task priority color for UI
  getTaskPriorityColor(priority: string): string {
    switch (priority) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  }

  // Get task status color for UI
  getTaskStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED':
      case 'DONE': return '#10b981';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'PENDING':
      case 'TODO': return '#f59e0b';
      case 'CANCELLED': return '#ef4444';
      case 'BLOCKED': return '#dc2626';
      case 'IN_REVIEW': return '#8b5cf6';
      case 'TESTING': return '#06b6d4';
      default: return '#6b7280';
    }
  }

  // Check if task is overdue
  isTaskOverdue(task: Task): boolean {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    return dueDate < now && task.status !== 'DONE';
  }

  // Get relative time for task creation
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minutes ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Get error message from error object
  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred while loading tasks';
  }
}