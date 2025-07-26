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

  // Forms - Fixed: Removed duplicate declaration
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
    // Fixed: Proper form initialization
    this.createSprintForm = this.initializeSprintForm();
    this.editSprintForm = this.initializeSprintForm();
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

  // Fixed: Renamed method to avoid duplicate
  private initializeSprintForm(): FormGroup {
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
      next: (data: any) => {
        this.project = data.project;
        this.sprints = data.sprints;
        this.processSprintTasks(Array.isArray(data.tasks) ? data.tasks : [data.tasks]);
        this.findCurrentSprint();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  private getProjectSprints(projectId: number): Promise<Sprint[]> {
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

  // Fixed: Proper type annotation for newStatus
  moveTaskToColumn(taskId: number, newStatus: string): void {
    const task = this.sprintTasks.find(t => t.id === taskId);
    if (task) {
      // Fixed: Cast to proper status type
      task.status = newStatus as Task['status'];
      // Mock API call to update task status
      this.updateSprintStats();
    }
  }

  // Rest of the methods remain the same...
  private findCurrentSprint(): void {
    this.currentSprint = this.sprints.find(s => s.status === 'ACTIVE') || null;
  }

  private generateBurndownData(): void {
    if (!this.currentSprint) return;

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

  // Additional helper methods
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

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  // Placeholder methods for template
  createSprint(): void {
    console.log('Create sprint');
  }

  editSprint(sprint: Sprint): void {
    console.log('Edit sprint:', sprint);
  }

  deleteSprint(sprint: Sprint): void {
    console.log('Delete sprint:', sprint);
  }

  startSprint(sprint: Sprint): void {
    console.log('Start sprint:', sprint);
  }

  completeSprint(sprint: Sprint): void {
    console.log('Complete sprint:', sprint);
  }

  addTaskToSprint(task: SprintTask): void {
    console.log('Add task to sprint:', task);
  }

  removeTaskFromSprint(task: SprintTask): void {
    console.log('Remove task from sprint:', task);
  }
}