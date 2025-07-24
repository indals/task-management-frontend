// src/app/core/models/notification.model.ts
export interface Notification {
  id: number;
  user_id: number;
  title?: string; // Optional title field
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'task_assignment' | 'task_update' | 'deadline_reminder';
  related_id?: number; // For linking to tasks, projects, etc.
  read: boolean;
  created_at: string;
  updated_at?: string;
  
  // Optional user information
  user?: {
    id: number;
    name: string;
    email: string;
  };
  
  // For backward compatibility
  createdAt?: Date;
  link?: string;
}