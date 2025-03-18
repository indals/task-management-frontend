import { User } from "./user.model";

// src/app/core/models/auth.model.ts
export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role?: string;
  }
  
  export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
  }

export type { User };
