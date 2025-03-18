import { User } from "./user.model";

// src/app/core/models/task.model.ts
export interface Task {
    subtasks: any;
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    assigned_to: User | null;
    created_by: User;
    due_date: string | null;
    created_at: string;
    updated_at: string;
  }