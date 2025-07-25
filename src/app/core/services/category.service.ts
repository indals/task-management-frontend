// src/app/core/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryStats
} from '../models/category.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api.interfaces';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Category CRUD Operations
  getAllCategories(includeInactive: boolean = false): Observable<Category[]> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('include_inactive', 'true');
    }

    return this.http.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES.BASE, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BY_ID(id))
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  createCategory(category: CreateCategoryRequest): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BASE, category)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  updateCategory(id: number, category: UpdateCategoryRequest): Observable<Category> {
    return this.http.put<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.BY_ID(id), category)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  deleteCategory(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.CATEGORIES.BY_ID(id))
      .pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Category hierarchy operations
  getParentCategories(): Observable<Category[]> {
    const params = new HttpParams().set('parent_only', 'true');
    return this.http.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES.BASE, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  getSubcategories(parentId: number): Observable<Category[]> {
    const params = new HttpParams().set('parent_id', parentId.toString());
    return this.http.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES.BASE, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  getCategoryHierarchy(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${API_ENDPOINTS.CATEGORIES.BASE}/hierarchy`)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Category statistics
  getCategoryStats(): Observable<CategoryStats> {
    return this.http.get<ApiResponse<CategoryStats>>(`${API_ENDPOINTS.CATEGORIES.BASE}/stats`)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Category ordering
  updateCategoryOrder(categoryOrders: { id: number; order: number }[]): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${API_ENDPOINTS.CATEGORIES.BASE}/reorder`, 
      { categories: categoryOrders }
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Helper methods
  getActiveCategories(): Observable<Category[]> {
    return this.getAllCategories(false);
  }

  getDefaultCategories(): Observable<Category[]> {
    const params = new HttpParams().set('default_only', 'true');
    return this.http.get<ApiResponse<Category[]>>(API_ENDPOINTS.CATEGORIES.BASE, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  searchCategories(query: string): Observable<Category[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<ApiResponse<Category[]>>(`${API_ENDPOINTS.CATEGORIES.BASE}/search`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Bulk operations
  bulkDeleteCategories(categoryIds: number[]): Observable<{ message: string; deleted_count: number }> {
    return this.http.delete<{ message: string; deleted_count: number }>(
      `${API_ENDPOINTS.CATEGORIES.BASE}/bulk-delete`,
      { body: { category_ids: categoryIds } }
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  bulkUpdateCategories(updates: { id: number; updates: UpdateCategoryRequest }[]): Observable<{ message: string; updated_count: number }> {
    return this.http.patch<{ message: string; updated_count: number }>(
      `${API_ENDPOINTS.CATEGORIES.BASE}/bulk-update`,
      { categories: updates }
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }
}