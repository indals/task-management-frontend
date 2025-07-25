// src/app/core/models/notification.model.ts
import { ApiResponse, PaginatedResponse } from '../interfaces/api.interfaces';

export interface Notification {
  id: number;
  user_id: number;
  task_id?: number;
  type: NotificationType;
  title: string;
  message: string;
  related_user_id?: number;
  project_id?: number;
  sprint_id?: number;
  read: boolean;
  read_at?: string;
  created_at: string;
  
  // Relationships
  task?: {
    id: number;
    title: string;
    priority: string;
  };
  related_user?: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
  };
  project?: {
    id: number;
    name: string;
  };
  sprint?: {
    id: number;
    name: string;
  };
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  read_count: number;
  notifications_by_type: Record<NotificationType, number>;
  recent_notifications: Notification[];
}

// Request/Response Interfaces
export interface NotificationFilters {
  unread_only?: boolean;
  type?: NotificationType[];
  project_id?: number[];
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export interface MarkNotificationReadRequest {
  notification_id: number;
}

export interface BulkNotificationAction {
  notification_ids: number[];
  action: 'mark_read' | 'delete';
}

// Enums and Types
export type NotificationType = 
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'TASK_OVERDUE'
  | 'COMMENT_ADDED'
  | 'PROJECT_UPDATED'
  | 'SPRINT_STARTED'
  | 'SPRINT_COMPLETED'
  | 'MENTION';

// Response Types
export type NotificationResponse = ApiResponse<Notification>;
export type NotificationListResponse = PaginatedResponse<Notification>;
export type NotificationStatsResponse = ApiResponse<NotificationStats>;
export type UnreadCountResponse = ApiResponse<{ unread_count: number }>;

// Notification Type Configuration
export const NOTIFICATION_TYPE_CONFIG = {
  TASK_ASSIGNED: {
    label: 'Task Assigned',
    icon: 'user-plus',
    color: '#007bff',
    priority: 'high'
  },
  TASK_UPDATED: {
    label: 'Task Updated',
    icon: 'edit',
    color: '#28a745',
    priority: 'medium'
  },
  TASK_COMPLETED: {
    label: 'Task Completed',
    icon: 'check-circle',
    color: '#28a745',
    priority: 'medium'
  },
  TASK_OVERDUE: {
    label: 'Task Overdue',
    icon: 'clock',
    color: '#dc3545',
    priority: 'critical'
  },
  COMMENT_ADDED: {
    label: 'New Comment',
    icon: 'message-circle',
    color: '#6f42c1',
    priority: 'medium'
  },
  PROJECT_UPDATED: {
    label: 'Project Updated',
    icon: 'folder',
    color: '#17a2b8',
    priority: 'low'
  },
  SPRINT_STARTED: {
    label: 'Sprint Started',
    icon: 'play-circle',
    color: '#28a745',
    priority: 'medium'
  },
  SPRINT_COMPLETED: {
    label: 'Sprint Completed',
    icon: 'flag',
    color: '#007bff',
    priority: 'medium'
  },
  MENTION: {
    label: 'Mentioned',
    icon: 'at-sign',
    color: '#e83e8c',
    priority: 'high'
  }
};

// Helper Functions
export const getNotificationPriority = (type: NotificationType): 'critical' | 'high' | 'medium' | 'low' => {
  return NOTIFICATION_TYPE_CONFIG[type]?.priority as 'critical' | 'high' | 'medium' | 'low' || 'low';
};

export const formatNotificationTime = (createdAt: string): string => {
  const now = new Date();
  const notificationTime = new Date(createdAt);
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return notificationTime.toLocaleDateString();
};

export const groupNotificationsByDate = (notifications: Notification[]): Record<string, Notification[]> => {
  const groups: Record<string, Notification[]> = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey: string;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = date.toLocaleDateString();
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });
  
  return groups;
};