// src/app/core/models/api-responses.ts
import { User } from "./user.model";

// Define the shape of comment data as it comes from the API
export interface CommentApiResponse {
  id: number;
  comment: string;      // API uses 'comment' for the text content
  text?: string;        // Sometimes might use 'text'
  user_id: number;
  author: User;
  created_at: string;
  createdAt?: string;   // Possibly returned in camelCase
  updated_at?: string;
  updatedAt?: string;   // Possibly returned in camelCase
}