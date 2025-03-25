// src/app/core/models/comment.model.ts
import { User } from "./user.model";

export interface Comment {
  id: number;
  text: string;          // Use camelCase for frontend consistency
  comment?: string;      // Adding this for template compatibility
  created_at?: string;   // Adding this for template compatibility
  author: User;
  createdAt: Date;       // Frontend uses Date objects for timestamps
  updatedAt?: Date;      // Optional as not all comments have been updated
}