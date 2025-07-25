// src/app/core/models/category.model.ts
import { User } from './user.model';

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_default: boolean;
  is_active: boolean;
  created_by: User;
  created_at: string;
  updated_at: string;
  task_count?: number;
  parent_id?: number;
  parent_category?: Category;
  subcategories?: Category[];
  order?: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_id?: number;
  order?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
  parent_id?: number;
  order?: number;
}

export interface CategoryStats {
  total_categories: number;
  active_categories: number;
  tasks_by_category: Record<string, number>;
  most_used_category: Category | null;
}

// Predefined category colors
export const CATEGORY_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9'  // Light Blue
] as const;

// Predefined category icons
export const CATEGORY_ICONS = [
  'work',
  'home',
  'school',
  'shopping_cart',
  'fitness_center',
  'restaurant',
  'travel_explore',
  'medical_services',
  'family_restroom',
  'sports_esports',
  'music_note',
  'book',
  'build',
  'business',
  'code'
] as const;