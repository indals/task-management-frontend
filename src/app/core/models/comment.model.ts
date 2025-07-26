// Fixed core/models/comment.model.ts - Unified comment model
import { User } from "./user.model";

export interface Comment {
  id: number;
  text: string;          // Primary field for comment content
  comment?: string;      // Alternative field name for API compatibility
  content?: string;      // Alternative field name used in some contexts
  author: User;
  user_id: number;       // API field for author ID
  created_at: string;    // API timestamp format
  createdAt: Date;       // Frontend Date object
  updated_at?: string;   // API timestamp format (optional)
  updatedAt?: Date;      // Frontend Date object (optional)
  task_id?: number;      // If this is a task comment
}

// For API responses that might have different field names
export interface CommentApiResponse {
  id: number;
  comment?: string;      // API might use 'comment' field
  text?: string;         // API might use 'text' field  
  content?: string;      // API might use 'content' field
  user_id: number;
  author?: User;         // Populated author object
  created_at: string;
  createdAt?: string;    // Possibly returned in camelCase
  updated_at?: string;
  updatedAt?: string;    // Possibly returned in camelCase
  task_id?: number;
}

// Helper function to normalize API response to frontend model
export function normalizeCommentFromApi(apiComment: CommentApiResponse): Comment {
  return {
    id: apiComment.id,
    text: apiComment.text || apiComment.comment || apiComment.content || '',
    comment: apiComment.comment,
    content: apiComment.content,
    author: apiComment.author!,
    user_id: apiComment.user_id,
    created_at: apiComment.created_at,
    createdAt: new Date(apiComment.created_at || apiComment.createdAt!),
    updated_at: apiComment.updated_at,
    updatedAt: apiComment.updated_at ? new Date(apiComment.updated_at) : undefined,
    task_id: apiComment.task_id
  };
}