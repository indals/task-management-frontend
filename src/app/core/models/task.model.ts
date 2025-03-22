import { User } from "./user.model";

// src/app/core/models/task.model.ts
export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: User | null;  // Keeping original snake_case for compatibility
  assignee?: User | null;    // Adding camelCase alias
  created_by: User;
  due_date: string | null;   // Keeping original snake_case
  dueDate?: string | null;   // Adding camelCase alias
  created_at: string;
  createdAt?: string;        // Adding camelCase alias
  updated_at: string;
  updatedAt?: string;        // Adding camelCase alias
  
  // Define subtasks properly to avoid any errors
  subtasks: Array<{
    id: number;
    title: string;
    completed: boolean;
  }>;
  
  // Define comments array
  comments?: Array<{
    id: number;
    text: string;
    author: User;
    createdAt: Date;
  }>;
}

// Temporary inline interfaces to avoid file creation
export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  taskId?: number;
}

export interface Comment {
  id: number;
  text: string;
  author: User;
  createdAt: Date;
  updatedAt?: Date;
}