// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/notifications`;

  constructor(private http: HttpClient) { }

  getNotifications(unreadOnly: boolean = false): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl, { params: { unread_only: unreadOnly.toString() } });
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.post(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}