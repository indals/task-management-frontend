import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { 
  Task, 
  TaskStatus, 
  TaskPriority,
  CreateTaskRequest,
  TaskFilters,
  TaskStatusUpdate
} from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';

interface TaskColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  icon: string;
  limit?: number;
}

@Component({
  selector: 'app-task-board',
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.scss']
})
export class TaskBoardComponent implements OnInit, OnDestroy {
  @Input() projectId?: number;
  
  project: Project | null = null;
  currentUser: User | null = null;
  
  // Task columns for Kanban board
  columns: TaskColumn[] = [
    {
      id: TaskStatus.TODO,
      title: 'To Do',
      tasks: [],
      color: 'primary',
      icon: 'circle',
      limit: 20
    },
    {
      id: TaskStatus.IN_PROGRESS,
      title: 'In Progress',
      tasks: [],
      color: 'warning',
      icon: 'play_circle',
      limit: 5
    },
    {
      id: TaskStatus.DONE,
      title: 'Done',
      tasks: [],
      color: 'success',
      icon: 'check_circle'
    },
    {
      id: TaskStatus.CANCELLED,
      title: 'Cancelled',
      tasks: [],
      color: 'danger',
      icon: 'cancel'
    }
  ];

  // Loading and error states
  isLoading = false;
  errorMessage: string | null = null;
  
  // Filters and search
  searchTerm = '';
  filterPriority: TaskPriority | 'all' = 'all';
  filterAssignee: number | 'all' = 'all';
  showFilters = false;
  
  // Available users for assignment
  availableUsers: User[] = [];
  
  // UI states
  selectedTask: Task | null = null;
  showTaskForm = false;
  showTaskDetails = false;
  draggedTask: Task | null = null;

  // Priority options
  priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: TaskPriority.LOW, label: 'Low' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.URGENT, label: 'Urgent' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Get project ID from route if not provided as input
    if (!this.projectId) {
      this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
        if (params['projectId']) {
          this.projectId = +params['projectId'];
        }
      });
    }

    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const requests = [];

    // Load project if projectId is provided
    if (this.projectId) {
      requests.push(this.projectService.getProjectById(this.projectId));
    }

    // Load available users
    requests.push(this.authService.getUsers());

    if (requests.length > 0) {
      forkJoin(requests).subscribe({
        next: (results) => {
          if (this.projectId && results[0]) {
            this.project = results[0] as Project;
            this.availableUsers = results[1] as User[];
          } else {
            this.availableUsers = results[0] as User[];
          }
          this.loadTasks();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to load initial data. Please try again.';
          console.error('Error loading initial data:', error);
        }
      });
    } else {
      this.loadTasks();
    }
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const filters: TaskFilters = {};

    if (this.projectId) {
      filters.project_id = this.projectId;
    }

    if (this.searchTerm.trim()) {
      filters.search = this.searchTerm.trim();
    }

    if (this.filterPriority !== 'all') {
      filters.priority = this.filterPriority as TaskPriority;
    }

    if (this.filterAssignee !== 'all') {
      filters.assignee = this.filterAssignee as number;
    }

    const taskObservable = this.projectId 
      ? this.taskService.getTasksByProject(this.projectId, filters)
      : this.taskService.getAllTasks(filters);

    taskObservable.subscribe({
      next: (tasks) => {
        this.distributeTasks(tasks);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load tasks. Please try again.';
        console.error('Error loading tasks:', error);
      }
    });
  }

  private distributeTasks(tasks: Task[]): void {
    // Clear all columns
    this.columns.forEach(column => column.tasks = []);

    // Distribute tasks to appropriate columns
    tasks.forEach(task => {
      const column = this.columns.find(col => col.id === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });

    // Sort tasks within each column by priority and due date
    this.columns.forEach(column => {
      column.tasks.sort((a, b) => {
        // First sort by priority
        const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // Then sort by due date
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (a.due_date) return -1;
        if (b.due_date) return 1;

        // Finally sort by creation date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });
  }

  // Drag and drop functionality
  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within the same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between columns
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getColumnStatus(event.container);
      
      if (newStatus && task.status !== newStatus) {
        this.updateTaskStatus(task, newStatus);
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      }
    }
  }

  private getColumnStatus(container: any): TaskStatus | null {
    const column = this.columns.find(col => col.tasks === container.data);
    return column ? column.id : null;
  }

  private updateTaskStatus(task: Task, newStatus: TaskStatus): void {
    const statusUpdate: TaskStatusUpdate = {
      status: newStatus,
      comment: `Status changed from ${task.status} to ${newStatus}`
    };

    const updateObservable = this.projectId
      ? this.taskService.updateTaskStatusInProject(this.projectId, task.id, statusUpdate)
      : this.taskService.updateTaskStatus(task.id, statusUpdate);

    updateObservable.subscribe({
      next: (updatedTask) => {
        task.status = updatedTask.status;
        task.updated_at = updatedTask.updated_at;
      },
      error: (error) => {
        // Revert the UI change if the API call fails
        this.loadTasks();
        this.errorMessage = 'Failed to update task status. Please try again.';
        console.error('Error updating task status:', error);
      }
    });
  }

  // Task actions
  openTaskForm(task?: Task): void {
    this.selectedTask = task || null;
    this.showTaskForm = true;
  }

  openTaskDetails(task: Task): void {
    this.selectedTask = task;
    this.showTaskDetails = true;
  }

  closeTaskForm(): void {
    this.showTaskForm = false;
    this.selectedTask = null;
  }

  closeTaskDetails(): void {
    this.showTaskDetails = false;
    this.selectedTask = null;
  }

  onTaskFormSubmit(taskData: CreateTaskRequest): void {
    if (this.projectId) {
      taskData.project_id = this.projectId;
    }

    if (this.selectedTask) {
      // Update existing task
      this.taskService.updateTask(this.selectedTask.id, taskData).subscribe({
        next: () => {
          this.closeTaskForm();
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage = 'Failed to update task. Please try again.';
          console.error('Error updating task:', error);
        }
      });
    } else {
      // Create new task
      const createObservable = this.projectId
        ? this.taskService.createTaskInProject(this.projectId, taskData)
        : this.taskService.createTask(taskData);

      createObservable.subscribe({
        next: () => {
          this.closeTaskForm();
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage = 'Failed to create task. Please try again.';
          console.error('Error creating task:', error);
        }
      });
    }
  }

  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      const deleteObservable = this.projectId
        ? this.taskService.deleteTaskFromProject(this.projectId, task.id)
        : this.taskService.deleteTask(task.id);

      deleteObservable.subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete task. Please try again.';
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  assignTask(task: Task, userId: number): void {
    const assignRequest = { user_id: userId };
    
    const assignObservable = this.projectId
      ? this.taskService.assignTaskInProject(this.projectId, task.id, assignRequest)
      : this.taskService.assignTask(task.id, assignRequest);

    assignObservable.subscribe({
      next: (updatedTask) => {
        task.assigned_to = updatedTask.assigned_to;
        task.assignee = updatedTask.assignee;
      },
      error: (error) => {
        this.errorMessage = 'Failed to assign task. Please try again.';
        console.error('Error assigning task:', error);
      }
    });
  }

  // Filter and search
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.loadTasks();
  }

  onFilterChange(): void {
    this.loadTasks();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterPriority = 'all';
    this.filterAssignee = 'all';
    this.loadTasks();
  }

  // Utility methods
  getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'success';
      case TaskPriority.MEDIUM:
        return 'info';
      case TaskPriority.HIGH:
        return 'warning';
      case TaskPriority.URGENT:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getPriorityIcon(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'arrow_downward';
      case TaskPriority.MEDIUM:
        return 'remove';
      case TaskPriority.HIGH:
        return 'arrow_upward';
      case TaskPriority.URGENT:
        return 'priority_high';
      default:
        return 'help';
    }
  }

  isOverdue(task: Task): boolean {
    if (!task.due_date) return false;
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return dueDate < today && task.status !== TaskStatus.DONE;
  }

  getDueDateColor(task: Task): string {
    if (!task.due_date) return '';
    
    const today = new Date();
    const dueDate = new Date(task.due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'danger'; // Overdue
    if (diffDays <= 1) return 'warning'; // Due today or tomorrow
    if (diffDays <= 3) return 'info'; // Due in 2-3 days
    return 'success'; // Due later
  }

  canEditTask(task: Task): boolean {
    return this.currentUser && 
           (this.currentUser.id === task.created_by.id || 
            (task.assigned_to && this.currentUser.id === task.assigned_to.id) ||
            this.currentUser.role === 'ADMIN');
  }

  canDeleteTask(task: Task): boolean {
    return this.currentUser && 
           (this.currentUser.id === task.created_by.id || 
            this.currentUser.role === 'ADMIN');
  }

  getColumnTaskCount(column: TaskColumn): string {
    const count = column.tasks.length;
    if (column.limit) {
      return `${count}/${column.limit}`;
    }
    return count.toString();
  }

  isColumnOverLimit(column: TaskColumn): boolean {
    return column.limit ? column.tasks.length > column.limit : false;
  }

  refreshBoard(): void {
    this.loadTasks();
  }
}