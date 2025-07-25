// src/app/features/teams/team-list/team-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, startWith, switchMap, map } from 'rxjs/operators';

import { Team } from '../../../core/models/team.model';
import { TeamService } from '../../../core/services/team.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  teams$: Observable<Team[]>;
  loading = false;
  error: string | null = null;
  
  // Search and filter controls
  searchControl = new FormControl('');
  showMyTeamsOnly = new FormControl(false);
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private teamService: TeamService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.teams$ = this.setupTeamsObservable();
  }

  ngOnInit(): void {
    this.loadTeams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupTeamsObservable(): Observable<Team[]> {
    return combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.showMyTeamsOnly.valueChanges.pipe(
        startWith(false)
      )
    ]).pipe(
      switchMap(([searchTerm, showMyTeamsOnly]) => {
        this.loading = true;
        this.error = null;
        
        if (showMyTeamsOnly) {
          return this.teamService.getMyTeams();
        } else {
          return this.teamService.getAllTeams(this.currentPage, this.pageSize).pipe(
            map(response => {
              this.totalItems = response.pagination.total_items;
              return response.data;
            })
          );
        }
      }),
      map(teams => {
        const searchTerm = this.searchControl.value?.toLowerCase() || '';
        if (searchTerm) {
          return teams.filter(team => 
            team.name.toLowerCase().includes(searchTerm) ||
            team.description?.toLowerCase().includes(searchTerm)
          );
        }
        return teams;
      }),
      takeUntil(this.destroy$)
    );
  }

  private loadTeams(): void {
    this.teams$.subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Failed to load teams. Please try again.';
        this.notificationService.showError('Failed to load teams');
        console.error('Error loading teams:', error);
      }
    });
  }

  onCreateTeam(): void {
    this.router.navigate(['/teams/new']);
  }

  onViewTeam(team: Team): void {
    this.router.navigate(['/teams', team.id]);
  }

  onEditTeam(team: Team): void {
    this.router.navigate(['/teams', team.id, 'edit']);
  }

  onDeleteTeam(team: Team): void {
    if (confirm(`Are you sure you want to delete the team "${team.name}"? This action cannot be undone.`)) {
      this.teamService.deleteTeam(team.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Team "${team.name}" deleted successfully`);
          this.loadTeams();
        },
        error: (error) => {
          this.notificationService.showError('Failed to delete team');
          console.error('Error deleting team:', error);
        }
      });
    }
  }

  onLeaveTeam(team: Team): void {
    if (confirm(`Are you sure you want to leave the team "${team.name}"?`)) {
      this.teamService.leaveTeam(team.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Left team "${team.name}" successfully`);
          this.loadTeams();
        },
        error: (error) => {
          this.notificationService.showError('Failed to leave team');
          console.error('Error leaving team:', error);
        }
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTeams();
  }

  onRefresh(): void {
    this.searchControl.setValue('');
    this.showMyTeamsOnly.setValue(false);
    this.currentPage = 1;
    this.loadTeams();
  }

  canEditTeam(team: Team): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    // User can edit if they are the creator or have admin role in the team
    return team.created_by.id === currentUser.id || 
           team.members?.some(member => 
             member.user.id === currentUser.id && 
             (member.role === 'OWNER' || member.role === 'ADMIN')
           ) || false;
  }

  canDeleteTeam(team: Team): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Only team owner can delete the team
    return team.created_by.id === currentUser.id ||
           team.members?.some(member => 
             member.user.id === currentUser.id && member.role === 'OWNER'
           ) || false;
  }

  canLeaveTeam(team: Team): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    // User can leave if they are a member but not the owner
    const userMembership = team.members?.find(member => member.user.id === currentUser.id);
    return userMembership && userMembership.role !== 'OWNER' || false;
  }
}