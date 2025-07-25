import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from './error-handler.service';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Comment } from '../models/comment.model';

export interface CreateCommentRequest {
  content: string;
  task_id: number;
  parent_comment_id?: number;
}

export interface UpdateCommentRequest {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Get all comments for a task
  getTaskComments(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(API_ENDPOINTS.TASKS.COMMENTS(taskId))
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Create a new comment
  createComment(comment: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${API_ENDPOINTS.TASKS.BASE}/${comment.task_id}/comments`, comment)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Update comment
  updateComment(commentId: number, comment: UpdateCommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${API_ENDPOINTS.TASKS.BASE}/comments/${commentId}`, comment)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Delete comment
  deleteComment(commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_ENDPOINTS.TASKS.BASE}/comments/${commentId}`)
      .pipe(
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Reply to a comment
  replyToComment(parentCommentId: number, content: string, taskId: number): Observable<Comment> {
    const comment: CreateCommentRequest = {
      content,
      task_id: taskId,
      parent_comment_id: parentCommentId
    };
    return this.createComment(comment);
  }
}