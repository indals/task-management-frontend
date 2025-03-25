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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id;
  
    if (!userId) {
      console.error('User ID not found!');
      return;
    }
  
    // const params = { assignee: userId }; // Pass userId as a query parameter
    const params = { created_by: userId, };
    this.taskService.getAllTasks(params).subscribe(
      (tasks) => {
        this.tasks = Array.isArray(tasks) ? tasks : [tasks]; // Ensure an array
        this.applyFilters();
      },
      (error) => {
        console.error('Error loading tasks:', error);
        this.tasks = [];
        this.applyFilters();
      }
    );
  }
  
  
  
  

  applyFilters(): void {
    if (!Array.isArray(this.tasks)) {
      console.error('Tasks is not an array:', this.tasks);
      this.filteredTasks = [];
      return;
    }
  
    this.filteredTasks = this.tasks.filter(task => {
      const matchesStatus = this.filterStatus === 'all' || task.status === this.filterStatus;
      const matchesSearch = !this.searchTerm || (task.title && task.title.toLowerCase().includes(this.searchTerm.toLowerCase()));
  
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
}
