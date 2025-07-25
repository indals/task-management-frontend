// src/app/features/tasks/enhanced-task-form/enhanced-task-form.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { Task, Subtask } from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-enhanced-task-form',
  templateUrl: './enhanced-task-form.component.html',
  styleUrls: ['./enhanced-task-form.component.scss']
})
export class EnhancedTaskFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private titleChangeSubject = new Subject<string>();

  // Form and Data
  taskForm: FormGroup;
  existingTask: Task | null = null;
  isEditMode = false;
  taskId: number | null = null;

  // Reference Data
  users: User[] = [];
  projects: Project[] = [];
  currentUser: User | null = null;

  // UI State
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showAdvancedOptions = false;
  activeStep = 1;
  totalSteps = 3;

  // Form Options
  priorityOptions = [
    { value: 'LOW', label: 'Low', color: '#10b981', icon: 'arrow_downward' },
    { value: 'MEDIUM', label: 'Medium', color: '#f59e0b', icon: 'remove' },
    { value: 'HIGH', label: 'High', color: '#ef4444', icon: 'arrow_upward' },
    { value: 'CRITICAL', label: 'Critical', color: '#dc2626', icon: 'priority_high' }
  ];

  statusOptions = [
    { value: 'BACKLOG', label: 'Backlog', color: '#6b7280' },
    { value: 'TODO', label: 'To Do', color: '#3b82f6' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b' },
    { value: 'IN_REVIEW', label: 'In Review', color: '#8b5cf6' },
    { value: 'TESTING', label: 'Testing', color: '#06b6d4' },
    { value: 'BLOCKED', label: 'Blocked', color: '#ef4444' },
    { value: 'DONE', label: 'Done', color: '#10b981' },
    { value: 'CANCELLED', label: 'Cancelled', color: '#6b7280' }
  ];

  taskTypeOptions = [
    { value: 'FEATURE', label: 'Feature', icon: 'new_releases' },
    { value: 'BUG', label: 'Bug', icon: 'bug_report' },
    { value: 'ENHANCEMENT', label: 'Enhancement', icon: 'upgrade' },
    { value: 'REFACTOR', label: 'Refactor', icon: 'build' },
    { value: 'DOCUMENTATION', label: 'Documentation', icon: 'description' },
    { value: 'TESTING', label: 'Testing', icon: 'verified' },
    { value: 'DEPLOYMENT', label: 'Deployment', icon: 'cloud_upload' },
    { value: 'RESEARCH', label: 'Research', icon: 'search' },
    { value: 'MAINTENANCE', label: 'Maintenance', icon: 'settings' },
    { value: 'SECURITY', label: 'Security', icon: 'security' }
  ];

  estimationUnitOptions = [
    { value: 'HOURS', label: 'Hours' },
    { value: 'DAYS', label: 'Days' },
    { value: 'STORY_POINTS', label: 'Story Points' }
  ];

  // Validation Messages
  validationMessages = {
    title: {
      required: 'Task title is required',
      minlength: 'Title must be at least 3 characters long',
      maxlength: 'Title cannot exceed 100 characters'
    },
    description: {
      required: 'Description is required',
      minlength: 'Description must be at least 10 characters long'
    },
    project_id: {
      required: 'Please select a project'
    },
    due_date: {
      futureDate: 'Due date must be in the future'
    },
    estimated_hours: {
      min: 'Estimated hours must be greater than 0',
      max: 'Estimated hours cannot exceed 1000'
    },
    story_points: {
      min: 'Story points must be at least 1',
      max: 'Story points cannot exceed 100'
    }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.taskForm = this.createForm();
    this.setupFormSubscriptions();
  }

  ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });

    // Check if editing existing task
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.taskId = parseInt(params['id']);
        this.isEditMode = true;
        this.loadExistingTask();
      }
    });

    this.loadReferenceData();
    this.setupTitleSuggestions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Basic Information
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10)
      ]],
      task_type: ['FEATURE', [Validators.required]],
      
      // Assignment and Project
      project_id: ['', [Validators.required]],
      assigned_to_id: [''],
      
      // Priority and Status
      priority: ['MEDIUM', [Validators.required]],
      status: ['TODO', [Validators.required]],
      
      // Dates
      due_date: ['', [this.futureDateValidator]],
      start_date: [''],
      
      // Estimation
      estimated_hours: [0, [Validators.min(0), Validators.max(1000)]],
      story_points: [1, [Validators.min(1), Validators.max(100)]],
      estimation_unit: ['HOURS'],
      
      // Advanced Options
      labels: [[]],
      acceptance_criteria: [''],
      
      // Subtasks
      subtasks: this.fb.array([]),
      
      // Dependencies
      parent_task_id: [''],
      blocked_by: [[]],
      
      // Additional Fields
      environment: [''],
      browser: [''],
      device: [''],
      reproduction_steps: [''],
      expected_behavior: [''],
      actual_behavior: ['']
    });
  }

  private setupFormSubscriptions(): void {
    // Watch for task type changes to show/hide relevant fields
    this.taskForm.get('task_type')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(taskType => {
      this.updateFieldsForTaskType(taskType);
    });

    // Watch for project changes to filter assignees
    this.taskForm.get('project_id')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(projectId => {
      this.filterAssigneesByProject(projectId);
    });

    // Auto-save draft (optional)
    this.taskForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(30000) // Save every 30 seconds
    ).subscribe(() => {
      this.saveDraft();
    });
  }

  private setupTitleSuggestions(): void {
    this.titleChangeSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(title => {
      // Could implement title suggestions based on similar tasks
      this.suggestTaskDetails(title);
    });
  }

  private loadReferenceData(): void {
    this.isLoading = true;
    
    // Load projects and users
    Promise.all([
      this.projectService.getProjects().toPromise(),
      this.authService.getUsers().toPromise()
    ]).then(([projects, users]) => {
      this.projects = projects || [];
      this.users = users || [];
      this.isLoading = false;
      
      // Set default project if only one available
      if (this.projects.length === 1) {
        this.taskForm.patchValue({ project_id: this.projects[0].id });
      }
    }).catch(error => {
      this.errorMessage = this.getErrorMessage(error);
      this.isLoading = false;
    });
  }

  private loadExistingTask(): void {
    if (!this.taskId) return;

    this.isLoading = true;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.existingTask = task;
        this.populateForm(task);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  private populateForm(task: Task): void {
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      task_type: 'FEATURE', // Default if not in API
      project_id: 1, // Would get from task.project_id
      assigned_to_id: task.assigned_to?.id || '',
      priority: task.priority,
      status: task.status,
      due_date: this.formatDateForInput(task.due_date),
      start_date: this.formatDateForInput(task.created_at),
      estimated_hours: 8, // Mock data
      story_points: Math.floor(Math.random() * 8) + 1,
      estimation_unit: 'HOURS',
      labels: [], // Mock data
      acceptance_criteria: 'User should be able to...' // Mock data
    });

    // Populate subtasks
    if (task.subtasks && task.subtasks.length > 0) {
      const subtasksArray = this.taskForm.get('subtasks') as FormArray;
      task.subtasks.forEach(subtask => {
        subtasksArray.push(this.createSubtaskFormGroup(subtask));
      });
    }
  }

  // Form Array Management
  get subtasks(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  addSubtask(): void {
    this.subtasks.push(this.createSubtaskFormGroup());
  }

  removeSubtask(index: number): void {
    this.subtasks.removeAt(index);
  }

  private createSubtaskFormGroup(subtask?: Subtask): FormGroup {
    return this.fb.group({
      id: [subtask?.id || null],
      title: [subtask?.title || '', [Validators.required, Validators.minLength(3)]],
      completed: [subtask?.completed || false],
      description: [''],
      assigned_to_id: [''],
      due_date: ['']
    });
  }

  // Labels Management
  get labels(): string[] {
    return this.taskForm.get('labels')?.value || [];
  }

  addLabel(label: string): void {
    if (label.trim() && !this.labels.includes(label.trim())) {
      const currentLabels = [...this.labels, label.trim()];
      this.taskForm.patchValue({ labels: currentLabels });
    }
  }

  removeLabel(label: string): void {
    const currentLabels = this.labels.filter(l => l !== label);
    this.taskForm.patchValue({ labels: currentLabels });
  }

  onLabelKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      this.addLabel(input.value);
      input.value = '';
    }
  }

  // Step Navigation
  nextStep(): void {
    if (this.activeStep < this.totalSteps) {
      this.activeStep++;
    }
  }

  previousStep(): void {
    if (this.activeStep > 1) {
      this.activeStep--;
    }
  }

  goToStep(step: number): void {
    this.activeStep = step;
  }

  // Form Submission
  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.markFormGroupTouched(this.taskForm);
      this.showValidationErrors();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    const formData = this.prepareFormData();
    const apiCall = this.isEditMode 
      ? this.taskService.updateTask(this.taskId!, formData)
      : this.taskService.createTask(formData);

    apiCall.subscribe({
      next: (task) => {
        this.successMessage = this.isEditMode 
          ? 'Task updated successfully!' 
          : 'Task created successfully!';
        
        this.clearDraft();
        
        setTimeout(() => {
          this.router.navigate(['/tasks', task.id]);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error);
        this.isSaving = false;
      }
    });
  }

  private prepareFormData(): any {
    const formValue = this.taskForm.value;
    
    return {
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      due_date: formValue.due_date || null,
      assigneeId: formValue.assigned_to_id ? parseInt(formValue.assigned_to_id) : null,
      // Add other fields as needed based on your API
      project_id: parseInt(formValue.project_id),
      status: formValue.status,
      task_type: formValue.task_type,
      estimated_hours: formValue.estimated_hours,
      story_points: formValue.story_points,
      labels: formValue.labels,
      acceptance_criteria: formValue.acceptance_criteria,
      subtasks: formValue.subtasks.filter((st: any) => st.title.trim())
    };
  }

  // Auto-save and Draft Management
  private saveDraft(): void {
    if (this.taskForm.dirty && this.taskForm.get('title')?.value) {
      const draftData = {
        ...this.taskForm.value,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('taskFormDraft', JSON.stringify(draftData));
    }
  }

  loadDraft(): void {
    const draftData = localStorage.getItem('taskFormDraft');
    if (draftData) {
      const draft = JSON.parse(draftData);
      if (confirm('A draft was found. Do you want to load it?')) {
        this.taskForm.patchValue(draft);
        
        // Restore subtasks
        const subtasksArray = this.taskForm.get('subtasks') as FormArray;
        draft.subtasks?.forEach((subtask: any) => {
          subtasksArray.push(this.createSubtaskFormGroup(subtask));
        });
      }
    }
  }

  private clearDraft(): void {
    localStorage.removeItem('taskFormDraft');
  }

  // Helper Methods
  private updateFieldsForTaskType(taskType: string): void {
    const bugFields = ['environment', 'browser', 'device', 'reproduction_steps', 'expected_behavior', 'actual_behavior'];
    
    if (taskType === 'BUG') {
      // Show bug-specific fields
      bugFields.forEach(field => {
        this.taskForm.get(field)?.setValidators([Validators.required]);
      });
    } else {
      // Hide bug-specific fields
      bugFields.forEach(field => {
        this.taskForm.get(field)?.clearValidators();
        this.taskForm.get(field)?.setValue('');
      });
    }
    
    // Update validation
    bugFields.forEach(field => {
      this.taskForm.get(field)?.updateValueAndValidity();
    });
  }

  private filterAssigneesByProject(projectId: string): void {
    // In a real app, you would filter users based on project membership
    // For now, this is a placeholder
    console.log('Filtering assignees for project:', projectId);
  }

  private suggestTaskDetails(title: string): void {
    // Could implement AI-powered suggestions based on title
    // For now, this is a placeholder
    console.log('Suggesting details for title:', title);
  }

  // Validation
  private futureDateValidator(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { futureDate: true };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  private showValidationErrors(): void {
    const firstErrorField = this.findFirstErrorField(this.taskForm);
    if (firstErrorField) {
      this.scrollToField(firstErrorField);
    }
  }

  private findFirstErrorField(formGroup: FormGroup, prefix = ''): string | null {
    for (const key of Object.keys(formGroup.controls)) {
      const control = formGroup.get(key);
      const fieldName = prefix ? `${prefix}.${key}` : key;
      
      if (control?.invalid && control?.touched) {
        return fieldName;
      }
      
      if (control instanceof FormGroup) {
        const nestedError = this.findFirstErrorField(control, fieldName);
        if (nestedError) return nestedError;
      }
    }
    return null;
  }

  private scrollToField(fieldName: string): void {
    const element = document.querySelector(`[formControlName="${fieldName}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // UI Helper Methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.taskForm.get(fieldName);
    if (field && field.errors && field.touched) {
      const errors = field.errors;
      const fieldMessages = this.validationMessages[fieldName as keyof typeof this.validationMessages];
      
      for (const errorType of Object.keys(errors)) {
        if (fieldMessages && fieldMessages[errorType as keyof typeof fieldMessages]) {
          return fieldMessages[errorType as keyof typeof fieldMessages];
        }
      }
    }
    return '';
  }

  onTitleChange(title: string): void {
    this.titleChangeSubject.next(title);
  }

  toggleAdvancedOptions(): void {
    this.showAdvancedOptions = !this.showAdvancedOptions;
  }

  cancel(): void {
    if (this.taskForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.goBack();
      }
    } else {
      this.goBack();
    }
  }

  private goBack(): void {
    if (this.isEditMode && this.taskId) {
      this.router.navigate(['/tasks', this.taskId]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  private formatDateForInput(date: string | null): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
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

  // Utility Methods for Template
  getPriorityIcon(priority: string): string {
    const option = this.priorityOptions.find(p => p.value === priority);
    return option?.icon || 'help';
  }

  getPriorityColor(priority: string): string {
    const option = this.priorityOptions.find(p => p.value === priority);
    return option?.color || '#6b7280';
  }

  getTaskTypeIcon(taskType: string): string {
    const option = this.taskTypeOptions.find(t => t.value === taskType);
    return option?.icon || 'task';
  }

  getStatusColor(status: string): string {
    const option = this.statusOptions.find(s => s.value === status);
    return option?.color || '#6b7280';
  }

  getStepStatus(step: number): 'completed' | 'active' | 'pending' {
    if (step < this.activeStep) return 'completed';
    if (step === this.activeStep) return 'active';
    return 'pending';
  }

  getUserDisplayName(user: User): string {
    return user.name || user.username || user.email;
  }
}