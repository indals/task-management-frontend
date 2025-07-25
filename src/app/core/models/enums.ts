// src/app/core/models/enums.ts

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  VIEWER = 'VIEWER'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
  // Legacy support
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  ON_HOLD = 'ON_HOLD'
}

export enum ContributorRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED'
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  OVERDUE_TASK = 'OVERDUE_TASK'
}

// Helper functions for UI display
export class EnumHelpers {
  static getTaskStatusColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
      case TaskStatus.PENDING:
        return 'primary';
      case TaskStatus.IN_PROGRESS:
        return 'warning';
      case TaskStatus.DONE:
      case TaskStatus.COMPLETED:
        return 'success';
      case TaskStatus.CANCELLED:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  static getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'success';
      case TaskPriority.MEDIUM:
        return 'info';
      case TaskPriority.HIGH:
        return 'warning';
      case TaskPriority.URGENT:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  static getProjectStatusColor(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'success';
      case ProjectStatus.COMPLETED:
        return 'primary';
      case ProjectStatus.ARCHIVED:
        return 'secondary';
      case ProjectStatus.ON_HOLD:
        return 'warning';
      default:
        return 'secondary';
    }
  }

  static getUserRoleColor(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'danger';
      case UserRole.MANAGER:
        return 'warning';
      case UserRole.EMPLOYEE:
        return 'info';
      case UserRole.VIEWER:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  static getNotificationTypeColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
      case NotificationType.PROJECT_CREATED:
        return 'primary';
      case NotificationType.TASK_COMPLETED:
      case NotificationType.PROJECT_UPDATED:
        return 'success';
      case NotificationType.DEADLINE_APPROACHING:
        return 'warning';
      case NotificationType.OVERDUE_TASK:
        return 'danger';
      case NotificationType.COMMENT_ADDED:
        return 'info';
      default:
        return 'secondary';
    }
  }

  static getUserRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.MANAGER:
        return 'Manager';
      case UserRole.EMPLOYEE:
        return 'Employee';
      case UserRole.VIEWER:
        return 'Viewer';
      default:
        return 'User';
    }
  }

  static getTaskStatusDisplayName(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.PENDING:
        return 'Pending';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.DONE:
        return 'Done';
      case TaskStatus.COMPLETED:
        return 'Completed';
      case TaskStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  static getPriorityDisplayName(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'Low';
      case TaskPriority.MEDIUM:
        return 'Medium';
      case TaskPriority.HIGH:
        return 'High';
      case TaskPriority.URGENT:
        return 'Urgent';
      default:
        return 'Unknown';
    }
  }

  static getProjectStatusDisplayName(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'Active';
      case ProjectStatus.COMPLETED:
        return 'Completed';
      case ProjectStatus.ARCHIVED:
        return 'Archived';
      case ProjectStatus.ON_HOLD:
        return 'On Hold';
      default:
        return 'Unknown';
    }
  }

  static getContributorRoleDisplayName(role: ContributorRole): string {
    switch (role) {
      case ContributorRole.OWNER:
        return 'Owner';
      case ContributorRole.ADMIN:
        return 'Admin';
      case ContributorRole.MEMBER:
        return 'Member';
      case ContributorRole.VIEWER:
        return 'Viewer';
      default:
        return 'Unknown';
    }
  }

  static getNotificationTypeDisplayName(type: NotificationType): string {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
        return 'Task Assigned';
      case NotificationType.TASK_UPDATED:
        return 'Task Updated';
      case NotificationType.TASK_COMPLETED:
        return 'Task Completed';
      case NotificationType.PROJECT_CREATED:
        return 'Project Created';
      case NotificationType.PROJECT_UPDATED:
        return 'Project Updated';
      case NotificationType.COMMENT_ADDED:
        return 'Comment Added';
      case NotificationType.DEADLINE_APPROACHING:
        return 'Deadline Approaching';
      case NotificationType.OVERDUE_TASK:
        return 'Overdue Task';
      default:
        return 'Notification';
    }
  }

  // Priority and status ordering for sorting
  static getTaskStatusOrder(status: TaskStatus): number {
    const order = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.PENDING]: 0,
      [TaskStatus.IN_PROGRESS]: 1,
      [TaskStatus.DONE]: 2,
      [TaskStatus.COMPLETED]: 2,
      [TaskStatus.CANCELLED]: 3
    };
    return order[status] ?? 4;
  }

  static getPriorityOrder(priority: TaskPriority): number {
    const order = {
      [TaskPriority.URGENT]: 0,
      [TaskPriority.HIGH]: 1,
      [TaskPriority.MEDIUM]: 2,
      [TaskPriority.LOW]: 3
    };
    return order[priority] ?? 4;
  }

  static getProjectStatusOrder(status: ProjectStatus): number {
    const order = {
      [ProjectStatus.ACTIVE]: 0,
      [ProjectStatus.ON_HOLD]: 1,
      [ProjectStatus.COMPLETED]: 2,
      [ProjectStatus.ARCHIVED]: 3
    };
    return order[status] ?? 4;
  }

  // Icon mappings
  static getTaskStatusIcon(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
      case TaskStatus.PENDING:
        return 'radio_button_unchecked';
      case TaskStatus.IN_PROGRESS:
        return 'play_circle';
      case TaskStatus.DONE:
      case TaskStatus.COMPLETED:
        return 'check_circle';
      case TaskStatus.CANCELLED:
        return 'cancel';
      default:
        return 'help';
    }
  }

  static getPriorityIcon(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'keyboard_arrow_down';
      case TaskPriority.MEDIUM:
        return 'remove';
      case TaskPriority.HIGH:
        return 'keyboard_arrow_up';
      case TaskPriority.URGENT:
        return 'priority_high';
      default:
        return 'help';
    }
  }

  static getProjectStatusIcon(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'play_arrow';
      case ProjectStatus.COMPLETED:
        return 'check_circle';
      case ProjectStatus.ARCHIVED:
        return 'archive';
      case ProjectStatus.ON_HOLD:
        return 'pause';
      default:
        return 'help';
    }
  }

  static getUserRoleIcon(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'admin_panel_settings';
      case UserRole.MANAGER:
        return 'supervisor_account';
      case UserRole.EMPLOYEE:
        return 'person';
      case UserRole.VIEWER:
        return 'visibility';
      default:
        return 'person';
    }
  }
}