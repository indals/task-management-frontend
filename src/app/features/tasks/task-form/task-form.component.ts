import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { AuthService, UserListItem } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() formSubmit = new EventEmitter<Task>();
  @Output() cancel = new EventEmitter<void>();

  taskForm!: FormGroup;
  users: UserListItem[] = [];
  submitted = false;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';

  // API-compliant options
  priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' }
  ];

  statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.task;
    this.initForm();
    this.loadUsers();

    if (this.isEditMode && this.task) {
      this.populateForm();
    }
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe({
        next: (users) => {
            this.users = users;
        },
        error: (error) => {
            console.error('Error fetching users:', error);
        }
    });
  }

  get f() { 
    return this.taskForm.controls; 
  }

  get subtasks(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  initForm(): void {
    this.taskForm = this.fb.group({
      id: [null],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      due_date: [null], // Changed to match API
      priority: ['MEDIUM'], // Default to API value
      status: ['PENDING'], // Default to API value
      assigneeId: [null],
      subtasks: this.fb.array([])
    });
  }

  populateForm(): void {
    if (!this.task) return;

    this.taskForm.patchValue({
      id: this.task.id,
      title: this.task.title,
      description: this.task.description,
      due_date: this.formatDateForInput(this.task.due_date),
      priority: this.task.priority,
      status: this.task.status,
      assigneeId: this.task.assigned_to?.id || null
    });

    // Handle subtasks if they exist
    if (this.task.subtasks && Array.isArray(this.task.subtasks)) {
      this.taskForm.setControl('subtasks', this.fb.array(
        this.task.subtasks.map((subtask: any) => this.fb.group({
          id: [subtask.id || null],
          title: [subtask.title, Validators.required],
          completed: [subtask.completed || false]
        }))
      ));
    }
  }

  formatDateForInput(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  addSubtask(): void {
    this.subtasks.push(this.fb.group({
      id: [null],
      title: ['', Validators.required],
      completed: [false]
    }));
  }

  removeSubtask(index: number): void {
    this.subtasks.removeAt(index);
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.taskForm.invalid) {
      this.markFormGroupTouched(this.taskForm);
      return;
    }

    this.isLoading = true;
    const formValue = this.taskForm.value;

    // Prepare API-compliant data
    const taskData: any = {
      title: formValue.title,
      description: formValue.description || '',
      priority: formValue.priority,
      due_date: formValue.due_date ? new Date(formValue.due_date).toISOString() : null,
      assigneeId: formValue.assigneeId ? Number(formValue.assigneeId) : null
    };

    // Only include status for updates (API might auto-set for new tasks)
    if (this.isEditMode) {
      taskData.status = formValue.status;
    }

    const apiCall = this.isEditMode 
      ? this.taskService.updateTask(formValue.id, taskData)
      : this.taskService.createTask(taskData);

    apiCall.subscribe({
      next: (response) => {
        this.isLoading = false;
        this.formSubmit.emit(response);
      },      error: (error) => {
        this.isLoading = false;
        console.error('Error saving task:', error);
        this.errorMessage = error.error?.error || 'Failed to save task. Please try again.';
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}