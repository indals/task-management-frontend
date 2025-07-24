// src/app/core/models/task.model.ts
import { User } from "./user.model";
import { Comment } from "./comment.model";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: User | null;
  assignee?: User | null;
  created_by: User;
  due_date: string | null;
  dueDate?: string | null;
  created_at: string;
  createdAt?: string;
  updated_at: string;
  updatedAt?: string;
  subtasks: Array<Subtask>;
  comments?: Array<Comment>;
}

export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  taskId?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: number;
  due_date?: string;
  subtasks?: Array<Subtask>;
}