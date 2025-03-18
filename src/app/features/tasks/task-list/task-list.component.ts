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

  constructor(
    private taskService: TaskService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getAllTasks().subscribe(
      (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
      },
      (error) => {
        console.error('Error loading tasks:', error);
      }
    );
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      // Filter by status
      if (this.filterStatus !== 'all' && task.status !== this.filterStatus) {
        return false;
      }
      
      // Filter by search term (with null check)
      if (this.searchTerm && task.title?.toLowerCase().includes(this.searchTerm.toLowerCase())) {
        return true;
      }
      
      return !this.searchTerm; // Show all if no search term
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
}
