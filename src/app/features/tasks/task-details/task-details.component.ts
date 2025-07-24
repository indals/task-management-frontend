import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
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
        // Transform API response to match our TypeScript model
        this.task = {
          ...task,
          comments: task.comments?.map((apiComment: any) => {
            const commentText = apiComment.comment || apiComment.text || '';
            const createdAtDate = apiComment.created_at ? 
                new Date(apiComment.created_at) : new Date();
                
            return {
              id: apiComment.id,
              text: commentText,
              comment: commentText, // Include comment field for template compatibility
              created_at: apiComment.created_at, // Include created_at for template
              author: apiComment.author,
              createdAt: createdAtDate
            } as Comment;
          }) || []
        };
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

    const updatedTask: any = { ...this.task, status: 'Completed' };
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
    const updatedSubtasks = this.task.subtasks.map((subtask: any) => {
      if (subtask.id === subtaskId) {
        return { ...subtask, completed: !subtask.completed };
      }
      return subtask;
    });

    // Update the task with the new subtasks
    const updatedTask: any = { ...this.task, subtasks: updatedSubtasks };
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
  
    // Send text in the format API expects
    const commentPayload = { text: this.newComment.trim() };
  
    // Explicitly type the response as any
    this.taskService.addComment(this.task.id, commentPayload).subscribe({
      next: (response: any) => {
        // Create a new comment that matches our Comment interface
        const commentText = response.comment || response.text || this.newComment.trim();
        const createdAtStr = response.created_at || response.createdAt;
        const createdAtDate = createdAtStr ? new Date(createdAtStr) : new Date();
        debugger;
        const newComment: Comment = {
          id: response.id,
          text: commentText,
          comment: commentText, // Add for template compatibility
          created_at: createdAtStr, // Add for template compatibility
          author: response.author,
          createdAt: createdAtDate,
          updatedAt: response.updated_at || response.updatedAt ? 
                     new Date(response.updated_at || response.updatedAt) : undefined
        };
  
        // Append the comment safely
        this.task = {
          ...this.task!,
          comments: [...(this.task?.comments || []), newComment]
        };
  
        // Clear the input field
        this.newComment = '';
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