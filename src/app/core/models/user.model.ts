// src/app/core/models/user.model.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user' | 'guest' | string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}