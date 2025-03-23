// src/app/core/models/comment.model.ts
import { User } from "./user.model";

export interface Comment {
    id: number; // Or string, depending on your backend
    text: string;
    author: User;
    createdAt: Date;
  }