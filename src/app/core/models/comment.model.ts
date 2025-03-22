// src/app/core/models/comment.model.ts
import { User } from "./user.model";

export interface Comment {
  id: number;
  text: string;
  author: User;
  createdAt: Date;
  updatedAt?: Date; // Optional
}