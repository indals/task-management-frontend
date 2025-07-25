import { User } from "./user.model";

export interface Project {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  created_by: User;
  members: User[];
  task_count?: number;
  // Legacy properties for backward compatibility
  createdAt?: Date;
  updatedAt?: Date;
  ownerId?: string;
  tasks_count?: number; // For backward compatibility
  estimated_hours?: number; // For backward compatibility
  completed_tasks?: number; // For backward compatibility
  pending_tasks?: number; // For backward compatibility
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'; // For backward compatibility
}