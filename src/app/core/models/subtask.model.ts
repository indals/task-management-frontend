// src/app/core/models/subtask.model.ts
export interface Subtask {
    id: number;
    title: string;
    completed: boolean;
    taskId?: number; // Optional reference to parent task
  }