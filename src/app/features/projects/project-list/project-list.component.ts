import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { 
  Project, 
  ProjectFilters, 
  ProjectStatus,
  AddContributorRequest 
} from '../../../core/models/project.model';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  currentUser: User | null = null;
  
  // Loading and error states
  isLoading = false;
  errorMessage: string | null = null;
  
  // Filter and search
  searchTerm = '';
  filterStatus: ProjectStatus | 'all' = 'all';
  sortBy: 'created_at' | 'updated_at' | 'title' | 'progress' = 'updated_at';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalProjects = 0;
  
  // UI states
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = false;
  selectedProjects: number[] = [];
  
  // Options
  statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: ProjectStatus.ACTIVE, label: 'Active' },
    { value: ProjectStatus.COMPLETED, label: 'Completed' },
    { value: ProjectStatus.ARCHIVED, label: 'Archived' },
    { value: ProjectStatus.ON_HOLD, label: 'On Hold' }
  ];
  
  sortOptions = [
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'created_at', label: 'Date Created' },
    { value: 'title', label: 'Project Name' },
    { value: 'progress', label: 'Progress' }
  ];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router
  ) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.loadProjects();
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadProjects();
    
    // Subscribe to project service loading state
    this.projectService.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.errorMessage = null;
    
    const filters: ProjectFilters = {
      page: this.currentPage,
      limit: this.pageSize,
      sort_by: this.sortBy,
      sort_order: this.sortOrder
    };

    if (this.filterStatus !== 'all') {
      filters.status = this.filterStatus as ProjectStatus;
    }

    if (this.searchTerm.trim()) {
      filters.search = this.searchTerm.trim();
    }

    this.projectService.getProjects(filters).subscribe({
      next: (projects) => {
        this.projects = projects;
        this.filteredProjects = projects;
        this.selectedProjects = [];
      },
      error: (error) => {
        this.errorMessage = 'Failed to load projects. Please try again.';
        console.error('Error loading projects:', error);
      }
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProjects();
  }

  onSortChange(): void {
    this.loadProjects();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.loadProjects();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProjects();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Project actions
  viewProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  editProject(project: Project): void {
    this.router.navigate(['/projects', project.id, 'edit']);
  }

  deleteProject(project: Project): void {
    if (confirm(`Are you sure you want to delete the project "${project.title}"?`)) {
      this.projectService.deleteProject(project.id).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete project. Please try again.';
          console.error('Error deleting project:', error);
        }
      });
    }
  }

  archiveProject(project: Project): void {
    if (confirm(`Are you sure you want to archive the project "${project.title}"?`)) {
      this.projectService.archiveProject(project.id).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error) => {
          this.errorMessage = 'Failed to archive project. Please try again.';
          console.error('Error archiving project:', error);
        }
      });
    }
  }

  duplicateProject(project: Project): void {
    const duplicateData = {
      title: `${project.title} (Copy)`,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date,
      tags: project.tags,
      budget: project.budget
    };

    this.projectService.createProject(duplicateData).subscribe({
      next: () => {
        this.loadProjects();
      },
      error: (error) => {
        this.errorMessage = 'Failed to duplicate project. Please try again.';
        console.error('Error duplicating project:', error);
      }
    });
  }

  // Bulk actions
  toggleProjectSelection(projectId: number): void {
    const index = this.selectedProjects.indexOf(projectId);
    if (index > -1) {
      this.selectedProjects.splice(index, 1);
    } else {
      this.selectedProjects.push(projectId);
    }
  }

  selectAllProjects(): void {
    if (this.selectedProjects.length === this.filteredProjects.length) {
      this.selectedProjects = [];
    } else {
      this.selectedProjects = this.filteredProjects.map(p => p.id);
    }
  }

  bulkArchiveProjects(): void {
    if (this.selectedProjects.length === 0) return;
    
    if (confirm(`Are you sure you want to archive ${this.selectedProjects.length} project(s)?`)) {
      const archivePromises = this.selectedProjects.map(id => 
        this.projectService.archiveProject(id).toPromise()
      );

      Promise.all(archivePromises).then(() => {
        this.selectedProjects = [];
        this.loadProjects();
      }).catch(error => {
        this.errorMessage = 'Failed to archive some projects. Please try again.';
        console.error('Error bulk archiving projects:', error);
      });
    }
  }

  bulkDeleteProjects(): void {
    if (this.selectedProjects.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedProjects.length} project(s)? This action cannot be undone.`)) {
      const deletePromises = this.selectedProjects.map(id => 
        this.projectService.deleteProject(id).toPromise()
      );

      Promise.all(deletePromises).then(() => {
        this.selectedProjects = [];
        this.loadProjects();
      }).catch(error => {
        this.errorMessage = 'Failed to delete some projects. Please try again.';
        console.error('Error bulk deleting projects:', error);
      });
    }
  }

  // Navigation
  createNewProject(): void {
    this.router.navigate(['/projects/new']);
  }

  viewProjectTasks(project: Project): void {
    this.router.navigate(['/projects', project.id, 'tasks']);
  }

  // Utility methods
  getStatusColor(status: ProjectStatus): string {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'success';
      case ProjectStatus.COMPLETED:
        return 'primary';
      case ProjectStatus.ARCHIVED:
        return 'secondary';
      case ProjectStatus.ON_HOLD:
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'danger';
  }

  canEditProject(project: Project): boolean {
    return this.currentUser && 
           (this.currentUser.id === project.created_by.id || 
            this.currentUser.role === 'ADMIN');
  }

  canDeleteProject(project: Project): boolean {
    return this.currentUser && 
           (this.currentUser.id === project.created_by.id || 
            this.currentUser.role === 'ADMIN');
  }

  refreshProjects(): void {
    this.loadProjects();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = 'all';
    this.sortBy = 'updated_at';
    this.sortOrder = 'desc';
    this.currentPage = 1;
    this.loadProjects();
  }
}