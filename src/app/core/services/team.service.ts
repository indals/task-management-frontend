// src/app/core/services/team.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import {
  Team,
  TeamMember,
  TeamInvitation,
  CreateTeamRequest,
  UpdateTeamRequest,
  UpdateTeamMemberRequest,
  InviteTeamMemberRequest,
  TeamStats
} from '../models/team.model';
import { User } from '../models/user.model';
import { ApiResponse, PaginatedResponse } from '../interfaces/api.interfaces';
import { API_ENDPOINTS } from '../constants/api.constants';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // Team CRUD Operations
  getAllTeams(page?: number, limit?: number): Observable<PaginatedResponse<Team>> {
    let params = new HttpParams();
    if (page) params = params.set('page', page.toString());
    if (limit) params = params.set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Team>>(API_ENDPOINTS.TEAMS.BASE, { params })
      .pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  getTeamById(id: number): Observable<Team> {
    return this.http.get<ApiResponse<Team>>(API_ENDPOINTS.TEAMS.BY_ID(id))
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  createTeam(team: CreateTeamRequest): Observable<Team> {
    return this.http.post<ApiResponse<Team>>(API_ENDPOINTS.TEAMS.BASE, team)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  updateTeam(id: number, team: UpdateTeamRequest): Observable<Team> {
    return this.http.put<ApiResponse<Team>>(API_ENDPOINTS.TEAMS.BY_ID(id), team)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  deleteTeam(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(API_ENDPOINTS.TEAMS.BY_ID(id))
      .pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Team Member Management
  getTeamMembers(teamId: number): Observable<TeamMember[]> {
    return this.http.get<ApiResponse<TeamMember[]>>(API_ENDPOINTS.TEAMS.MEMBERS(teamId))
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  addTeamMember(teamId: number, userId: number, role: string): Observable<TeamMember> {
    return this.http.post<ApiResponse<TeamMember>>(
      API_ENDPOINTS.TEAMS.ADD_MEMBER(teamId), 
      { user_id: userId, role }
    ).pipe(
      map(response => response.data),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  updateTeamMember(teamId: number, userId: number, updates: UpdateTeamMemberRequest): Observable<TeamMember> {
    return this.http.put<ApiResponse<TeamMember>>(
      API_ENDPOINTS.TEAMS.REMOVE_MEMBER(teamId, userId), 
      updates
    ).pipe(
      map(response => response.data),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  removeTeamMember(teamId: number, userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      API_ENDPOINTS.TEAMS.REMOVE_MEMBER(teamId, userId)
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Team Invitations
  getTeamInvitations(teamId?: number, status?: string): Observable<TeamInvitation[]> {
    let params = new HttpParams();
    if (teamId) params = params.set('team_id', teamId.toString());
    if (status) params = params.set('status', status);

    return this.http.get<ApiResponse<TeamInvitation[]>>(API_ENDPOINTS.TEAMS.INVITATIONS, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  inviteTeamMember(teamId: number, invitation: InviteTeamMemberRequest): Observable<TeamInvitation> {
    return this.http.post<ApiResponse<TeamInvitation>>(
      API_ENDPOINTS.TEAMS.ADD_MEMBER(teamId), 
      { ...invitation, team_id: teamId }
    ).pipe(
      map(response => response.data),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  acceptInvitation(invitationId: number): Observable<{ message: string; team_member: TeamMember }> {
    return this.http.post<{ message: string; team_member: TeamMember }>(
      API_ENDPOINTS.TEAMS.ACCEPT_INVITATION(invitationId), 
      {}
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  declineInvitation(invitationId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      API_ENDPOINTS.TEAMS.DECLINE_INVITATION(invitationId), 
      {}
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  resendInvitation(invitationId: number): Observable<TeamInvitation> {
    return this.http.post<ApiResponse<TeamInvitation>>(
      `${API_ENDPOINTS.TEAMS.INVITATIONS}/${invitationId}/resend`, 
      {}
    ).pipe(
      map(response => response.data),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  cancelInvitation(invitationId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${API_ENDPOINTS.TEAMS.INVITATIONS}/${invitationId}`
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }

  // Team Statistics
  getTeamStats(teamId: number): Observable<TeamStats> {
    return this.http.get<ApiResponse<TeamStats>>(`${API_ENDPOINTS.TEAMS.BY_ID(teamId)}/stats`)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  // Helper methods
  getMyTeams(): Observable<Team[]> {
    return this.http.get<ApiResponse<Team[]>>(`${API_ENDPOINTS.TEAMS.BASE}/my-teams`)
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  getTeamsByUser(userId: number): Observable<Team[]> {
    const params = new HttpParams().set('user_id', userId.toString());
    return this.http.get<ApiResponse<Team[]>>(API_ENDPOINTS.TEAMS.BASE, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  searchUsers(query: string): Observable<User[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ApiResponse<User[]>>(`${API_ENDPOINTS.AUTH.USERS}/search`, { params })
      .pipe(
        map(response => response.data),
        catchError(this.errorHandler.handleError.bind(this.errorHandler))
      );
  }

  checkTeamMembership(teamId: number, userId: number): Observable<boolean> {
    return this.http.get<{ is_member: boolean }>(
      `${API_ENDPOINTS.TEAMS.BY_ID(teamId)}/members/${userId}/check`
    ).pipe(
      map(response => response.is_member),
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  leaveTeam(teamId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${API_ENDPOINTS.TEAMS.BY_ID(teamId)}/leave`, 
      {}
    ).pipe(catchError(this.errorHandler.handleError.bind(this.errorHandler)));
  }
}