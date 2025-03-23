import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
// Import Comment from our newly created model
import { Comment } from '../../../core/models/comment.model';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss']
})
export class TaskDetailsComponent implements OnInit {
  task: Task | null = null;
  loading: boolean = true;
  error: string | null = null;
  newComment: string = '';

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

  markAsComplete(): void {
    if (!this.task) return;

    const updatedTask = { ...this.task, status: 'Completed' };
    this.taskService.updateTask(this.task.id, updatedTask).subscribe({
      next: (task) => {
        this.task = task;
      },
      error: (error) => {
        this.error = 'Failed to update task status: ' + (error?.message || 'Unknown error');
      }
    });
  }

  toggleSubtask(subtaskId: number): void {
    if (!this.task || !this.task.subtasks) return;

    // Find the subtask and toggle its completed status
    const updatedSubtasks = this.task.subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        return { ...subtask, completed: !subtask.completed };
      }
      return subtask;
    });

    // Update the task with the new subtasks
    const updatedTask = { ...this.task, subtasks: updatedSubtasks };
    this.taskService.updateTask(this.task.id, updatedTask).subscribe({
      next: (task) => {
        this.task = task;
      },
      error: (error) => {
        this.error = 'Failed to update subtask: ' + (error?.message || 'Unknown error');
      }
    });
  }

  addComment(): void {
    if (!this.task || !this.newComment.trim()) return;

    // Create a new comment object
    const comment: Comment = {
      id: Math.floor(Math.random() * 10000), // Temporary ID, should be generated on server
      text: this.newComment.trim(),
      author: {
        id: '1', name: 'Current User',
        email: '',
        role: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }, // Should use real current user
      createdAt: new Date()
    };

    // Add the comment to the task
    const comments = this.task.comments ? [...this.task.comments, comment] : [comment];
    const updatedTask = { ...this.task, comments };

    this.taskService.updateTask(this.task.id, updatedTask).subscribe({
      next: (task) => {
        this.task = task;
        this.newComment = ''; // Clear the input
      },
      error: (error) => {
        this.error = 'Failed to add comment: ' + (error?.message || 'Unknown error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}