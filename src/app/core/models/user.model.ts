// src/app/core/models/user.model.ts
export interface User {
  id: number;
  name: string;
  username?: string; // Added username for backward compatibility
  email: string;
  role?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'admin' | 'user' | 'guest' | string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  created_at?: string;
  updated_at?: string;
}

export interface UserListItem {
  id: number;
  name: string;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string; // Added role field
  created_at?: string; // Added created_at field
  updated_at?: string; // Added updated_at field
}