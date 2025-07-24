// src/app/core/models/user.model.ts
export interface User {
  id: number; // Change from string to number
  name: string;
  email: string;
  role?: 'admin' | 'user' | 'guest' | string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Add this interface too:
export interface UserListItem {
  id: number;
  username: string;
  email: string; // This was missing
  first_name?: string;
  last_name?: string;
}