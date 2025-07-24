// src/app/core/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReportData {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  average_completion_time: number;
}

export interface ProjectReport {
  id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  status: string;
}


@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private BASE_URL = 'http://127.0.0.1:5000/api/analytics';

  constructor(private http: HttpClient) {}

  getReportData(period: string): Observable<ReportData> {
    return this.http.get<ReportData>(`${this.BASE_URL}/summary?period=${period}`);
  }

  getProjectReports(): Observable<ProjectReport[]> {
    return this.http.get<ProjectReport[]>(`${this.BASE_URL}/projects`);
  }
}
