import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filterStatus: string = 'all';
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;
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

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id;
  
    if (!userId) {
      this.errorMessage = 'User ID not found!';
      this.isLoading = false;
      return;
    }
  
    const params = { created_by: userId };
    this.taskService.getAllTasks(params).subscribe({
      next: (tasks) => {
        this.tasks = Array.isArray(tasks) ? tasks : [tasks];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading tasks: ' + (error?.message || 'Unknown error');
        this.tasks = [];
        this.applyFilters();
        this.isLoading = false;
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

  console.log('Filter status:', this.filterStatus);
  console.log('Search term:', this.searchTerm);
  console.log('Applying filters with tasks:', this.tasks);

  this.filteredTasks = this.tasks.filter(task => {
    const matchesStatus =
      this.filterStatus === 'all' ||
      (task.status && task.status.toLowerCase() === this.filterStatus.toLowerCase());

    const matchesSearch =
      !this.searchTerm ||
      (task.title && task.title.toLowerCase().includes(this.searchTerm.toLowerCase()));

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
      this.taskService.deleteTask(taskId).subscribe(
        () => {
          this.tasks = this.tasks.filter(task => task.id !== taskId);
          this.applyFilters();
        },
        (error) => {
          console.error('Error deleting task:', error);
        }
      );
    }
  }

  // Add these methods to your existing task-list.component.ts file

getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING': return 'Pending';
    case 'IN_PROGRESS': return 'In Progress';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
}

getPriorityClass(priority: string): string {
  return `priority-${priority.toLowerCase()}`;
}

getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'HIGH': return 'High';
    case 'MEDIUM': return 'Medium';
    case 'LOW': return 'Low';
    default: return priority;
  }
}
}
