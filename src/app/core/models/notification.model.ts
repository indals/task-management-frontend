// src/app/core/models/notification.model.ts
export interface Notification {
    id: number;
    user_id: number;
    task_id: number;
    message: string;
    read: boolean;
    created_at: string;
    updated_at: string;
  }