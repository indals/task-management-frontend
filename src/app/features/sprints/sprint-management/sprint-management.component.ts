// src/app/features/sprints/sprint-management/sprint-management.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task } from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';

// Sprint interfaces (would typically be in models folder)
export interface Sprint {
  id: number;
  name: string;
  description: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  project_id: number;
  start_date: string;
  end_date: string;
  goal: string;
  capacity_hours: number;
  velocity_points: number;
  tasks_count: number;
  completed_tasks: number;
  remaining_points: number;
  created_at: string;
  updated_at: string;
}

export interface SprintTask extends Task {
  story_points: number;
  sprint_id: number | null;
  in_sprint: boolean;
}

export interface BurndownDataPoint {
  date: string;
  remaining_points: number;
  ideal_remaining: number;
  completed_points: number;
}

@Component({
  selector: 'app-sprint-management',
  templateUrl: './sprint-management.component.html',
  styleUrls: ['./sprint-management.component.scss']
})
export class SprintManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  project: Project | null = null;
  currentSprint: Sprint | null = null;
  sprints: Sprint[] = [];
  sprintTasks: SprintTask[] = [];
  backlogTasks: SprintTask[] = [];
  burndownData: BurndownDataPoint[] = [];
  currentUser: User | null = null;

  // UI State
  isLoading = false;
  errorMessage: string | null = null;
  showCreateSprintModal = false;
  showEditSprintModal = false;
  activeTab: 'board' | 'backlog' | 'burndown' | 'sprints' = 'board';

  // Forms
  createSprintForm: FormGroup;
  editSprintForm: FormGroup;

  // Sprint Board Columns
  sprintColumns = [
    { status: 'BACKLOG', title: 'Sprint Backlog', limit: null },
    { status: 'TODO', title: 'To Do', limit: 5 },
    { status: 'IN_PROGRESS', title: 'In Progress', limit: 3 },
    { status: 'IN_REVIEW', title: 'In Review', limit: 3 },
    { status: 'TESTING', title: 'Testing', limit: 2 },
    { status: 'DONE', title: 'Done', limit: null }
  ];

  // Sprint Status Options
  sprintStatusOptions = [
    { value: 'PLANNED', label: 'Planned', color: '#6b7280' },
    { value: 'ACTIVE', label: 'Active', color: '#10b981' },
    { value: 'COMPLETED', label: 'Completed', color: '#3b82f6' },
    { value: 'CANCELLED', label: 'Cancelled', color: '#ef4444' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.createSprintForm = this.createSprintForm();
    this.editSprintForm = this.createSprintForm();
  }

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });

    // Get project ID from route
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const projectId = params['projectId'];
      if (projectId) {
        this.loadProjectData(parseInt(projectId));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createSprintForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      goal: ['', [Validators.required]],
      capacity_hours: [40, [Validators.required, Validators.min(1)]],
      velocity_points: [21, [Validators.required, Validators.min(1)]]
    });
  }

  private loadProjectData(projectId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      project: this.projectService.getProjectById(projectId),
      sprints: this.getProjectSprints(projectId),
      tasks: this.taskService.getAllTasks({ project_id: projectId })
    }).subscribe({
      next: (data) => {
        this.project = data.project;
        this.sprints = data.sprints;
        this.processSprintTasks(data.tasks);
        this.findCurrentSprint();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  private getProjectSprints(projectId: number): any {
    // Mock API call - replace with actual sprint service
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Sprint 1 - Foundation',
            description: 'Setting up the basic foundation and core features',
            status: 'COMPLETED',
            project_id: projectId,
            start_date: '2024-01-01',
            end_date: '2024-01-14',
            goal: 'Establish project foundation and core architecture',
            capacity_hours: 80,
            velocity_points: 25,
            tasks_count: 8,
            completed_tasks: 8,
            remaining_points: 0,
            created_at: '2023-12-20',
            updated_at: '2024-01-14'
          },
          {
            id: 2,
            name: 'Sprint 2 - Core Features',
            description: 'Implementing core business logic and user features',
            status: 'ACTIVE',
            project_id: projectId,
            start_date: '2024-01-15',
            end_date: '2024-01-28',
            goal: 'Complete core user functionality and business logic',
            capacity_hours: 80,
            velocity_points: 28,
            tasks_count: 10,
            completed_tasks: 6,
            remaining_points: 12,
            created_at: '2024-01-10',
            updated_at: '2024-01-25'
          }
        ]);
      }, 500);
    });
  }

  private processSprintTasks(tasks: Task[]): void {
    // Convert tasks to sprint tasks and separate sprint vs backlog
    this.sprintTasks = [];
    this.backlogTasks = [];

    tasks.forEach(task => {
      const sprintTask: SprintTask = {
        ...task,
        story_points: Math.floor(Math.random() * 8) + 1, // Mock story points
        sprint_id: Math.random() > 0.6 ? (this.currentSprint?.id || null) : null,
        in_sprint: false
      };

      if (sprintTask.sprint_id) {
        sprintTask.in_sprint = true;
        this.sprintTasks.push(sprintTask);
      } else {
        this.backlogTasks.push(sprintTask);
      }
    });

    this.generateBurndownData();
  }

  private findCurrentSprint(): void {
    this.currentSprint = this.sprints.find(s => s.status === 'ACTIVE') || null;
  }

  private generateBurndownData(): void {
    if (!this.currentSprint) return;

    // Generate mock burndown data
    const startDate = new Date(this.currentSprint.start_date);
    const endDate = new Date(this.currentSprint.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPoints = this.currentSprint.velocity_points;

    this.burndownData = [];
    
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const idealRemaining = Math.max(0, totalPoints - (totalPoints / totalDays) * i);
      const actualProgress = Math.min(i / totalDays + (Math.random() - 0.5) * 0.2, 1);
      const actualRemaining = Math.max(0, totalPoints * (1 - actualProgress));

      this.burndownData.push({
        date: currentDate.toISOString().split('T')[0],
        remaining_points: Math.round(actualRemaining),
        ideal_remaining: Math.round(idealRemaining),
        completed_points: Math.round(totalPoints - actualRemaining)
      });
    }
  }

  // Sprint Actions
  createSprint(): void {
    this.showCreateSprintModal = true;
    this.createSprintForm.reset();
    
    // Set default dates (2-week sprint)
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    this.createSprintForm.patchValue({
      start_date: this.formatDateForInput(startDate.toISOString()),
      end_date: this.formatDateForInput(endDate.toISOString()),
      capacity_hours: 80,
      velocity_points: 21
    });
  }

  editSprint(sprint: Sprint): void {
    this.currentSprint = sprint;
    this.showEditSprintModal = true;
    this.editSprintForm.patchValue({
      name: sprint.name,
      description: sprint.description,
      start_date: this.formatDateForInput(sprint.start_date),
      end_date: this.formatDateForInput(sprint.end_date),
      goal: sprint.goal,
      capacity_hours: sprint.capacity_hours,
      velocity_points: sprint.velocity_points
    });
  }

  deleteSprint(sprint: Sprint): void {
    if (confirm(`Are you sure you want to delete "${sprint.name}"?`)) {
      // Mock API call - replace with actual sprint service
      this.sprints = this.sprints.filter(s => s.id !== sprint.id);
      if (this.currentSprint?.id === sprint.id) {
        this.findCurrentSprint();
      }
    }
  }

  startSprint(sprint: Sprint): void {
    if (confirm(`Start "${sprint.name}"? This will make it the active sprint.`)) {
      // Mock API call - replace with actual sprint service
      this.sprints.forEach(s => {
        if (s.status === 'ACTIVE') s.status = 'PLANNED';
      });
      sprint.status = 'ACTIVE';
      this.currentSprint = sprint;
    }
  }

  completeSprint(sprint: Sprint): void {
    if (confirm(`Complete "${sprint.name}"? This action cannot be undone.`)) {
      // Mock API call - replace with actual sprint service
      sprint.status = 'COMPLETED';
      if (this.currentSprint?.id === sprint.id) {
        this.currentSprint = null;
      }
    }
  }

  // Task Actions
  addTaskToSprint(task: SprintTask): void {
    if (!this.currentSprint) {
      this.errorMessage = 'No active sprint to add tasks to';
      return;
    }

    task.sprint_id = this.currentSprint.id;
    task.in_sprint = true;
    
    this.backlogTasks = this.backlogTasks.filter(t => t.id !== task.id);
    this.sprintTasks.push(task);
    
    this.updateSprintStats();
  }

  removeTaskFromSprint(task: SprintTask): void {
    task.sprint_id = null;
    task.in_sprint = false;
    
    this.sprintTasks = this.sprintTasks.filter(t => t.id !== task.id);
    this.backlogTasks.push(task);
    
    this.updateSprintStats();
  }

  moveTaskToColumn(taskId: number, newStatus: string): void {
    const task = this.sprintTasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      // Mock API call to update task status
      this.updateSprintStats();
    }
  }

  private updateSprintStats(): void {
    if (!this.currentSprint) return;

    const sprintTasksCount = this.sprintTasks.length;
    const completedTasksCount = this.sprintTasks.filter(t => t.status === 'DONE').length;
    const remainingPoints = this.sprintTasks
      .filter(t => t.status !== 'DONE')
      .reduce((sum, task) => sum + task.story_points, 0);

    this.currentSprint.tasks_count = sprintTasksCount;
    this.currentSprint.completed_tasks = completedTasksCount;
    this.currentSprint.remaining_points = remainingPoints;
  }

  // Modal Actions
  closeCreateSprintModal(): void {
    this.showCreateSprintModal = false;
    this.createSprintForm.reset();
  }

  closeEditSprintModal(): void {
    this.showEditSprintModal = false;
    this.editSprintForm.reset();
    this.currentSprint = null;
  }

  submitCreateSprint(): void {
    if (this.createSprintForm.invalid) {
      this.markFormGroupTouched(this.createSprintForm);
      return;
    }

    const formData = this.createSprintForm.value;
    const sprintData = {
      ...formData,
      project_id: this.project?.id,
      status: 'PLANNED',
      tasks_count: 0,
      completed_tasks: 0,
      remaining_points: formData.velocity_points
    };

    // Mock API call - replace with actual sprint service
    const newSprint: Sprint = {
      ...sprintData,
      id: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.sprints.unshift(newSprint);
    this.closeCreateSprintModal();
  }

  submitEditSprint(): void {
    if (this.editSprintForm.invalid || !this.currentSprint) {
      this.markFormGroupTouched(this.editSprintForm);
      return;
    }

    const formData = this.editSprintForm.value;
    
    // Mock API call - replace with actual sprint service
    Object.assign(this.currentSprint, {
      ...formData,
      updated_at: new Date().toISOString()
    });

    this.closeEditSprintModal();
  }

  // UI Helpers
  getTasksByStatus(status: string): SprintTask[] {
    return this.sprintTasks.filter(task => task.status === status);
  }

  getColumnTaskCount(status: string): number {
    return this.getTasksByStatus(status).length;
  }

  isColumnOverLimit(status: string): boolean {
    const column = this.sprintColumns.find(col => col.status === status);
    if (!column?.limit) return false;
    return this.getColumnTaskCount(status) > column.limit;
  }

  getSprintProgress(): number {
    if (!this.currentSprint || this.currentSprint.velocity_points === 0) return 0;
    const completedPoints = this.currentSprint.velocity_points - this.currentSprint.remaining_points;
    return Math.round((completedPoints / this.currentSprint.velocity_points) * 100);
  }

  getSprintDaysRemaining(): number {
    if (!this.currentSprint) return 0;
    const endDate = new Date(this.currentSprint.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getSprintStatusColor(status: string): string {
    const option = this.sprintStatusOptions.find(opt => opt.value === status);
    return option?.color || '#6b7280';
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  }

  formatDateForInput(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Drag and Drop
  onTaskDrop(event: DragEvent, targetStatus: string): void {
    event.preventDefault();
    const taskId = parseInt(event.dataTransfer?.getData('text/plain') || '0');
    if (taskId) {
      this.moveTaskToColumn(taskId, targetStatus);
    }
  }

  onTaskDragStart(event: DragEvent, taskId: number): void {
    event.dataTransfer?.setData('text/plain', taskId.toString());
  }

  onTaskDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // Backlog Drag and Drop
  onBacklogTaskDrop(event: DragEvent): void {
    event.preventDefault();
    const taskId = parseInt(event.dataTransfer?.getData('text/plain') || '0');
    const task = this.sprintTasks.find(t => t.id === taskId);
    if (task) {
      this.removeTaskFromSprint(task);
    }
  }

  onSprintTaskDrop(event: DragEvent): void {
    event.preventDefault();
    const taskId = parseInt(event.dataTransfer?.getData('text/plain') || '0');
    const task = this.backlogTasks.find(t => t.id === taskId);
    if (task) {
      this.addTaskToSprint(task);
    }
  }

  // Form Validation
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be greater than ${field.errors['min'].min}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Sprint name',
      description: 'Description',
      start_date: 'Start date',
      end_date: 'End date',
      goal: 'Sprint goal',
      capacity_hours: 'Capacity hours',
      velocity_points: 'Velocity points'
    };
    return labels[fieldName] || fieldName;
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/projects']);
  }

  viewTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }
}