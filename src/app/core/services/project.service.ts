// src/app/core/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'api/projects';
  
  // Dummy data for development (remove in production)
  private mockProjects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Company website redesign project',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-02-20'),
      ownerId: 'user1',
      status: 'active'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'iOS and Android app development',
      createdAt: new Date('2023-03-10'),
      updatedAt: new Date('2023-03-10'),
      ownerId: 'user1',
      status: 'active'
    },
    {
      id: '3',
      name: 'Marketing Campaign',
      description: 'Q2 marketing campaign',
      createdAt: new Date('2023-02-05'),
      updatedAt: new Date('2023-02-28'),
      ownerId: 'user2',
      status: 'completed'
    }
  ];

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    // For development, return mock data
    // In production, uncomment the HTTP call
    return of(this.mockProjects);
    // return this.http.get<Project[]>(this.apiUrl);
  }

  getProject(id: string): Observable<Project> {
    // For development
    const project = this.mockProjects.find(p => p.id === id);
    return of(project as Project);
    // return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  getRecentProjects(): Observable<Project[]> {
    // Sort by updatedAt date and return most recent
    const sortedProjects = [...this.mockProjects]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    return of(sortedProjects);
  }

  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Observable<Project> {
    // In production, use HTTP post
    return of({
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    } as Project);
    // return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: string, changes: Partial<Project>): Observable<Project> {
    // In production, use HTTP put/patch
    return of({
      ...this.mockProjects.find(p => p.id === id),
      ...changes,
      updatedAt: new Date()
    } as Project);
    // return this.http.patch<Project>(`${this.apiUrl}/${id}`, changes);
  }

  deleteProject(id: string): Observable<void> {
    // In production, use HTTP delete
    return of(undefined);
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}