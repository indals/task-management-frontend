// src/app/core/models/task-comment.model.ts
export interface TaskComment {
    id: number;
    task_id: number;
    user_id: number;
    comment: string;
    created_at: string;
    updated_at: string;
  }