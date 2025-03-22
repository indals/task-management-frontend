// src/app/core/models/project.model.ts
export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    status: 'active' | 'completed' | 'archived';
  }