import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent implements OnInit {
  task: Task | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) { }

  ngOnInit(): void {
    this.loadTask();
  }

  loadTask(): void {
    const taskIdStr = this.route.snapshot.paramMap.get('id');
    const taskId = taskIdStr ? Number(taskIdStr) : null;

    if (!taskId || isNaN(taskId)) {
      this.error = 'Invalid task ID';
      this.loading = false;
      return;
    }

    this.taskService.getTaskById(taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load task: ' + (error?.message || 'Unknown error');
        this.loading = false;
      }
    });
  }

  editTask(): void {
    if (this.task) {
      this.router.navigate(['/tasks/edit', this.task.id]);
    }
  }

  deleteTask(): void {
    if (!this.task) return;

    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(this.task.id).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.error = 'Failed to delete task: ' + (error?.message || 'Unknown error');
        }
      });
    }
  }

  updateTaskStatus(status: string): void {
    if (!this.task) return;

    const updatedTask = { ...this.task, status };
    this.taskService.updateTask(this.task.id, updatedTask).subscribe({
      next: (task) => {
        this.task = task;
      },
      error: (error) => {
        this.error = 'Failed to update task status: ' + (error?.message || 'Unknown error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}
