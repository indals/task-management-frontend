export interface TaskCompletionAnalytics {
  period: string;
  start_date: string;
  end_date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  daily_completion: {
    date: string;
    completed: number;
    created: number;
  }[];
  weekly_completion: {
    week: string;
    completed: number;
    created: number;
  }[];
  monthly_completion: {
    month: string;
    completed: number;
    created: number;
  }[];
}

export interface UserProductivityAnalytics {
  user_id: number;
  user_name: string;
  user_email: string;
  period: string;
  start_date: string;
  end_date: string;
  total_tasks_assigned: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  average_completion_time_hours: number;
  total_hours_logged: number;
  daily_productivity: {
    date: string;
    tasks_completed: number;
    hours_logged: number;
  }[];
}

export interface TaskStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TaskPriorityDistribution {
  priority: string;
  count: number;
  percentage: number;
}

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
  user_id?: number;
  project_id?: number;
  sprint_id?: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface TeamPerformanceMetrics {
  team_size: number;
  total_tasks: number;
  completed_tasks: number;
  average_completion_rate: number;
  total_hours_logged: number;
  average_hours_per_task: number;
  most_productive_member: {
    user_id: number;
    user_name: string;
    completion_rate: number;
  };
  least_productive_member: {
    user_id: number;
    user_name: string;
    completion_rate: number;
  };
}

export interface ProjectAnalytics {
  project_id: number;
  project_name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  total_story_points: number;
  completed_story_points: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  efficiency_ratio: number;
  team_members_count: number;
  sprints_count: number;
  active_sprints_count: number;
}