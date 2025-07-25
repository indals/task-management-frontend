import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, combineLatest } from 'rxjs';
import { Task } from '../../../core/models/task.model';
import { TaskService, TaskFilters, TaskStatistics } from '../../../core/services/task.service';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { APP_CONFIG } from '../../../core/constants/api.constants';

interface TaskListColumn {
  key: string;
  label: string;
  sortable: boolean;
  visible: boolean;
}

interface BulkAction {
  key: string;
  label: string;
  icon: string;
  color: string;
  requiresConfirmation: boolean;
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Data properties
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedTasks: Set<number> = new Set();
  statistics: TaskStatistics | null = null;
  users: any[] = [];

  // Filter and search properties
  filters: TaskFilters = {
    page: 1,
    limit: APP_CONFIG.DEFAULT_PAGE_SIZE
  };
  searchTerm: string = '';
  
  // UI state properties
  isLoading: boolean = false;
  isExporting: boolean = false;
  isPerformingBulkAction: boolean = false;
  errorMessage: string | null = null;
  viewMode: 'list' | 'cards' | 'kanban' = 'list';
  sortBy: string = 'created_at';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Pagination
  currentPage: number = 1;
  totalItems: number = 0;
  totalPages: number = 0;
  pageSize: number = APP_CONFIG.DEFAULT_PAGE_SIZE;

  // Configuration
  columns: TaskListColumn[] = [
    { key: 'title', label: 'Title', sortable: true, visible: true },
    { key: 'assigned_user', label: 'Assignee', sortable: true, visible: true },
    { key: 'priority', label: 'Priority', sortable: true, visible: true },
    { key: 'status', label: 'Status', sortable: true, visible: true },
    { key: 'due_date', label: 'Due Date', sortable: true, visible: true },
    { key: 'created_at', label: 'Created', sortable: true, visible: false },
    { key: 'updated_at', label: 'Updated', sortable: true, visible: false }
  ];

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' }
  ];

  bulkActions: BulkAction[] = [
    { key: 'assign', label: 'Assign to User', icon: 'fas fa-user-plus', color: 'primary', requiresConfirmation: false },
    { key: 'change_status', label: 'Change Status', icon: 'fas fa-edit', color: 'info', requiresConfirmation: false },
    { key: 'change_priority', label: 'Change Priority', icon: 'fas fa-flag', color: 'warning', requiresConfirmation: false },
    { key: 'export', label: 'Export Selected', icon: 'fas fa-download', color: 'secondary', requiresConfirmation: false },
    { key: 'delete', label: 'Delete Selected', icon: 'fas fa-trash', color: 'danger', requiresConfirmation: true }
  ];

  // Advanced filter panel
  showAdvancedFilters: boolean = false;
  
  // Bulk action modal
  showBulkActionModal: boolean = false;
  selectedBulkAction: string = '';
  bulkActionData: any = {};

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.subscribeToTaskUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filters.search = searchTerm;
      this.filters.page = 1;
      this.loadTasks();
    });
  }

  private loadInitialData(): void {
    combineLatest([
      this.userService.getUsersForAssignment(),
      this.taskService.getTaskStatistics()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([users, statistics]) => {
        this.users = users;
        this.statistics = statistics;
        this.loadTasks();
      },
      error: (error) => {
        this.handleError('Failed to load initial data', error);
      }
    });
  }

  private subscribeToTaskUpdates(): void {
    this.taskService.tasks$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(tasks => {
      this.tasks = tasks;
      this.applyFiltersAndSort();
    });

    this.taskService.statistics$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(statistics => {
      this.statistics = statistics;
    });
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.taskService.getAllTasks(this.filters).subscribe({
      next: (response) => {
        this.tasks = response.data;
        this.totalItems = response.pagination.total;
        this.totalPages = response.pagination.pages;
        this.currentPage = response.pagination.page;
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Failed to load tasks', error);
        this.isLoading = false;
      }
    });
  }

  private applyFiltersAndSort(): void {
    let filtered = [...this.tasks];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.assigned_user?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
          break;
        case 'priority':
          const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a[this.sortBy as keyof Task];
          bValue = b[this.sortBy as keyof Task];
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredTasks = filtered;
  }

  // Event handlers
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadTasks();
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadTasks();
  }

  onPageSizeChange(size: number): void {
    this.filters.limit = size;
    this.filters.page = 1;
    this.loadTasks();
  }

  onViewModeChange(mode: 'list' | 'cards' | 'kanban'): void {
    this.viewMode = mode;
  }

  // Task selection
  toggleTaskSelection(taskId: number): void {
    if (this.selectedTasks.has(taskId)) {
      this.selectedTasks.delete(taskId);
    } else {
      this.selectedTasks.add(taskId);
    }
  }

  toggleAllTasksSelection(): void {
    if (this.isAllTasksSelected()) {
      this.selectedTasks.clear();
    } else {
      this.filteredTasks.forEach(task => this.selectedTasks.add(task.id));
    }
  }

  isTaskSelected(taskId: number): boolean {
    return this.selectedTasks.has(taskId);
  }

  isAllTasksSelected(): boolean {
    return this.filteredTasks.length > 0 && 
           this.filteredTasks.every(task => this.selectedTasks.has(task.id));
  }

  getSelectedTasksCount(): number {
    return this.selectedTasks.size;
  }

  // Navigation
  viewTaskDetails(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  createNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  editTask(taskId: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/tasks', taskId, 'edit']);
  }

  // Quick actions
  quickStatusChange(task: Task, newStatus: string, event: Event): void {
    event.stopPropagation();
    
    this.taskService.updateTask(task.id, { status: newStatus as any }).subscribe({
      next: (updatedTask) => {
        this.notificationService.showSuccess(`Task status updated to ${newStatus}`);
        this.loadTasks();
      },
      error: (error) => {
        this.handleError('Failed to update task status', error);
      }
    });
  }

  quickAssignTask(task: Task, userId: number, event: Event): void {
    event.stopPropagation();
    
    this.taskService.assignTask(task.id, userId).subscribe({
      next: (updatedTask) => {
        const user = this.users.find(u => u.id === userId);
        this.notificationService.showSuccess(`Task assigned to ${user?.name || 'user'}`);
        this.loadTasks();
      },
      error: (error) => {
        this.handleError('Failed to assign task', error);
      }
    });
  }

  deleteTask(taskId: number, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Task deleted successfully');
          this.loadTasks();
        },
        error: (error) => {
          this.handleError('Failed to delete task', error);
        }
      });
    }
  }

  // Bulk actions
  openBulkActionModal(action: string): void {
    this.selectedBulkAction = action;
    this.showBulkActionModal = true;
    this.bulkActionData = {};
  }

  executeBulkAction(): void {
    if (this.selectedTasks.size === 0) {
      this.notificationService.showWarning('Please select at least one task');
      return;
    }

    this.isPerformingBulkAction = true;
    const taskIds = Array.from(this.selectedTasks);

    switch (this.selectedBulkAction) {
      case 'delete':
        this.bulkDeleteTasks(taskIds);
        break;
      case 'assign':
        this.bulkAssignTasks(taskIds, this.bulkActionData.userId);
        break;
      case 'change_status':
        this.bulkChangeStatus(taskIds, this.bulkActionData.status);
        break;
      case 'change_priority':
        this.bulkChangePriority(taskIds, this.bulkActionData.priority);
        break;
      case 'export':
        this.exportSelectedTasks(taskIds);
        break;
    }
  }

  private bulkDeleteTasks(taskIds: number[]): void {
    this.taskService.bulkDeleteTasks(taskIds).subscribe({
      next: () => {
        this.notificationService.showSuccess(`${taskIds.length} tasks deleted successfully`);
        this.selectedTasks.clear();
        this.closeBulkActionModal();
        this.loadTasks();
      },
      error: (error) => {
        this.handleError('Failed to delete tasks', error);
      },
      complete: () => {
        this.isPerformingBulkAction = false;
      }
    });
  }

  private bulkAssignTasks(taskIds: number[], userId: number): void {
    // Implementation for bulk assign
    // This would require a bulk assign endpoint or multiple single assigns
    this.notificationService.showInfo('Bulk assign feature coming soon');
    this.isPerformingBulkAction = false;
    this.closeBulkActionModal();
  }

  private bulkChangeStatus(taskIds: number[], status: string): void {
    // Implementation for bulk status change
    this.notificationService.showInfo('Bulk status change feature coming soon');
    this.isPerformingBulkAction = false;
    this.closeBulkActionModal();
  }

  private bulkChangePriority(taskIds: number[], priority: string): void {
    // Implementation for bulk priority change
    this.notificationService.showInfo('Bulk priority change feature coming soon');
    this.isPerformingBulkAction = false;
    this.closeBulkActionModal();
  }

  private exportSelectedTasks(taskIds: number[]): void {
    this.isExporting = true;
    
    this.taskService.exportTasks('csv', { 
      search: taskIds.join(',') 
    }).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, 'selected-tasks.csv');
        this.notificationService.showSuccess('Tasks exported successfully');
        this.closeBulkActionModal();
      },
      error: (error) => {
        this.handleError('Failed to export tasks', error);
      },
      complete: () => {
        this.isExporting = false;
        this.isPerformingBulkAction = false;
      }
    });
  }

  closeBulkActionModal(): void {
    this.showBulkActionModal = false;
    this.selectedBulkAction = '';
    this.bulkActionData = {};
  }

  // Export functionality
  exportTasks(format: 'csv' | 'excel' | 'pdf' = 'csv'): void {
    this.isExporting = true;
    
    this.taskService.exportTasks(format, this.filters).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `tasks.${format}`);
        this.notificationService.showSuccess('Tasks exported successfully');
      },
      error: (error) => {
        this.handleError('Failed to export tasks', error);
      },
      complete: () => {
        this.isExporting = false;
      }
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Utility methods
  refreshTasks(): void {
    this.selectedTasks.clear();
    this.loadTasks();
    this.taskService.getTaskStatistics().subscribe();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  clearFilters(): void {
    this.filters = {
      page: 1,
      limit: this.filters.limit
    };
    this.searchTerm = '';
    this.loadTasks();
  }

  getPriorityColor(priority: string): string {
    return APP_CONFIG.TASK_PRIORITY_COLORS[priority as keyof typeof APP_CONFIG.TASK_PRIORITY_COLORS] || '#6c757d';
  }

  getStatusColor(status: string): string {
    return APP_CONFIG.TASK_STATUS_COLORS[status as keyof typeof APP_CONFIG.TASK_STATUS_COLORS] || '#6c757d';
  }

  getOverdueTasksCount(): number {
    return this.statistics?.overdue || 0;
  }

  getCompletionRate(): number {
    return this.statistics?.completion_rate || 0;
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = message;
    this.notificationService.showError(message);
  }
}
