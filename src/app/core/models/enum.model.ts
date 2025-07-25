export interface EnumValue {
  value: string;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UserRoleEnum extends EnumValue {
  permissions?: string[];
  hierarchy_level?: number;
}

export interface TaskStatusEnum extends EnumValue {
  is_completed?: boolean;
  is_active?: boolean;
  next_statuses?: string[];
}

export interface TaskPriorityEnum extends EnumValue {
  severity_level?: number;
  escalation_hours?: number;
}

export interface TaskTypeEnum extends EnumValue {
  default_estimation_unit?: string;
  requires_approval?: boolean;
}

export interface ProjectStatusEnum extends EnumValue {
  is_active?: boolean;
  allows_new_tasks?: boolean;
}

export interface SprintStatusEnum extends EnumValue {
  is_active?: boolean;
  allows_task_changes?: boolean;
}

export interface EstimationUnitEnum extends EnumValue {
  conversion_factor?: number;
  default_value?: number;
}

export interface EnumResponse {
  user_roles: UserRoleEnum[];
  task_statuses: TaskStatusEnum[];
  task_priorities: TaskPriorityEnum[];
  task_types: TaskTypeEnum[];
  project_statuses: ProjectStatusEnum[];
  sprint_statuses: SprintStatusEnum[];
  estimation_units: EstimationUnitEnum[];
}

// Helper interfaces for form dropdowns
export interface DropdownOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: string;
  color?: string;
}

export interface StatusTransition {
  from_status: string;
  to_status: string;
  allowed: boolean;
  requires_permission?: string;
  confirmation_message?: string;
}