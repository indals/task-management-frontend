
// src/app/core/models/analytics.model.ts
export interface UserPerformance {
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
  }

  export interface TaskDistribution {
    status: string;
    count: number;
  }







//   // src/app/core/models/user.model.ts
// export interface User {
//   id: number;
//   name: string;
//   email: string;
//   role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
//   created_at: string;
//   updated_at: string;
//   // For backward compatibility
//   createdAt?: Date;
//   updatedAt?: Date;
//   avatar?: string;
// }

// // src/app/core/models/task.model.ts
// export interface Task {
//   id: number;
//   title: string;
//   description: string;
//   status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
//   priority: 'LOW' | 'MEDIUM' | 'HIGH';
//   assigned_to: User;
//   created_by: User;
//   due_date: string;
//   created_at: string;
//   updated_at: string;
//   comments_count: number;
//   comments?: TaskComment[];
// }

// // src/app/core/models/task-comment.model.ts
// export interface TaskComment {
//   id: number;
//   task_id: number;
//   user_id: number;
//   comment: string;
//   created_at: string;
//   updated_at: string;
//   user: User;
//   author?: User; // For backward compatibility
// }

// // src/app/core/models/project.model.ts
// export interface Project {
//   id: number;
//   name: string;
//   description: string;
//   created_at: string;
//   updated_at: string;
//   owner_id: number;
//   status: 'active' | 'completed' | 'archived';
//   owner: User;
//   // For backward compatibility
//   createdAt?: Date;
//   updatedAt?: Date;
//   ownerId?: string;
// }

// // src/app/core/models/notification.model.ts
// export interface Notification {
//   id: number;
//   user_id: number;
//   task_id: number;
//   message: string;
//   read: boolean;
//   created_at: string;
//   updated_at: string;
//   user: User;
//   task: {
//     id: number;
//     title: string;
//   };
//   // For backward compatibility
//   createdAt?: Date;
//   type?: 'info' | 'warning' | 'success' | 'error';
//   link?: string;
// }

// // src/app/core/models/auth.model.ts
// export interface LoginRequest {
//   email: string;
//   password: string;
// }

// export interface RegisterRequest {
//   name: string;
//   email: string;
//   password: string;
//   role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
// }

// export interface AuthResponse {
//   access_token: string;
//   user: User;
// }

// // src/app/core/models/analytics.model.ts
// export interface TaskCompletionRate {
//   user_id: number;
//   period: string;
//   total_tasks: number;
//   completed_tasks: number;
//   completion_rate: number;
//   pending_tasks: number;
//   in_progress_tasks: number;
//   cancelled_tasks: number;
// }

// export interface UserPerformance {
//   user_id: number;
//   user_name: string;
//   total_assigned_tasks: number;
//   completed_tasks: number;
//   overdue_tasks: number;
//   average_completion_time_days: number;
//   tasks_by_priority: {
//     HIGH: number;
//     MEDIUM: number;
//     LOW: number;
//   };
//   tasks_by_status: {
//     PENDING: number;
//     IN_PROGRESS: number;
//     COMPLETED: number;
//     CANCELLED: number;
//   };
// }

// export interface TaskDistribution {
//   total_tasks: number;
//   status_distribution?: {
//     [key: string]: {
//       count: number;
//       percentage: number;
//     };
//   };
//   priority_distribution?: {
//     [key: string]: {
//       count: number;
//       percentage: number;
//     };
//   };
// }