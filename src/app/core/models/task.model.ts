// src/app/core/models/task.model.ts
import { User } from "./user.model";
import { Comment } from "./comment.model"; // Import from separate file

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
  subtasks: Array<Subtask>;
  
  // Use imported Comment interface
  comments?: Array<Comment>;
}

// Subtask interface
export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  taskId?: number;
}