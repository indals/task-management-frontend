
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