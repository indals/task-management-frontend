import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { 
  Task, 
  CreateTaskRequest, 
  BulkTaskRequest, 
  BulkDeleteRequest,
  TaskPriority,
  TaskStatus
} from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';

interface BulkTaskData {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId?: number;
  due_date?: string;
  tags?: string[];
  estimated_hours?: number;
}

@Component({
  selector: 'app-bulk-task-manager',
  templateUrl: './bulk-task-manager.component.html',
  styleUrls: ['./bulk-task-manager.component.scss']
})
export class BulkTaskManagerComponent implements OnInit, OnDestroy {
  @Input() projectId?: number;
  @Input() selectedTasks: Task[] = [];
  @Output() tasksCreated = new EventEmitter<Task[]>();
  @Output() tasksDeleted = new EventEmitter<number[]>();
  @Output() close = new EventEmitter<void>();

  bulkForm!: FormGroup;
  availableUsers: User[] = [];
  
  // Operation modes
  mode: 'create' | 'delete' | 'import' | 'export' = 'create';
  
  // Loading and error states
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // CSV import/export
  csvFile: File | null = null;
  csvData: BulkTaskData[] = [];
  csvPreview: string[][] = [];
  showCsvPreview = false;
  
  // Bulk operation results
  operationResults: {
    successful: number;
    failed: number;
    errors: string[];
  } = { successful: 0, failed: 0, errors: [] };

  // Options
  priorityOptions = [
    { value: TaskPriority.LOW, label: 'Low' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.URGENT, label: 'Urgent' }
  ];

  // CSV template
  csvTemplate = [
    ['Title', 'Description', 'Priority', 'Assignee Email', 'Due Date', 'Tags', 'Estimated Hours'],
    ['Sample Task 1', 'Description for task 1', 'MEDIUM', 'user@example.com', '2024-12-31', 'tag1,tag2', '8'],
    ['Sample Task 2', 'Description for task 2', 'HIGH', 'user2@example.com', '2024-12-25', 'tag3', '4']
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
    
    // Set mode based on selected tasks
    if (this.selectedTasks.length > 0) {
      this.mode = 'delete';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.bulkForm = this.fb.group({
      tasks: this.fb.array([]),
      commonSettings: this.fb.group({
        priority: [TaskPriority.MEDIUM],
        assigneeId: [null],
        due_date: [null],
        tags: [[]],
        estimated_hours: [null]
      })
    });

    // Add initial task rows
    this.addTaskRow();
    this.addTaskRow();
    this.addTaskRow();
  }

  private loadUsers(): void {
    this.authService.getUsers().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (users) => {
        this.availableUsers = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  get tasksFormArray(): FormArray {
    return this.bulkForm.get('tasks') as FormArray;
  }

  get commonSettings(): FormGroup {
    return this.bulkForm.get('commonSettings') as FormGroup;
  }

  // Form management
  addTaskRow(): void {
    const taskGroup = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: [TaskPriority.MEDIUM],
      assigneeId: [null],
      due_date: [null],
      tags: [[]],
      estimated_hours: [null],
      useCommonSettings: [false]
    });

    this.tasksFormArray.push(taskGroup);
  }

  removeTaskRow(index: number): void {
    if (this.tasksFormArray.length > 1) {
      this.tasksFormArray.removeAt(index);
    }
  }

  applyCommonSettings(): void {
    const commonSettings = this.commonSettings.value;
    
    this.tasksFormArray.controls.forEach(control => {
      const taskGroup = control as FormGroup;
      if (taskGroup.get('useCommonSettings')?.value) {
        taskGroup.patchValue({
          priority: commonSettings.priority,
          assigneeId: commonSettings.assigneeId,
          due_date: commonSettings.due_date,
          tags: commonSettings.tags,
          estimated_hours: commonSettings.estimated_hours
        });
      }
    });
  }

  // Bulk operations
  createBulkTasks(): void {
    if (this.bulkForm.invalid) {
      this.markFormGroupTouched(this.bulkForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const tasksData: CreateTaskRequest[] = this.tasksFormArray.value
      .filter((task: any) => task.title.trim())
      .map((task: any) => ({
        title: task.title.trim(),
        description: task.description || '',
        priority: task.priority,
        assigneeId: task.assigneeId,
        due_date: task.due_date,
        tags: Array.isArray(task.tags) ? task.tags : 
              (task.tags ? task.tags.split(',').map((t: string) => t.trim()) : []),
        estimated_hours: task.estimated_hours,
        project_id: this.projectId
      }));

    if (tasksData.length === 0) {
      this.errorMessage = 'Please provide at least one task with a title.';
      this.isLoading = false;
      return;
    }

    const bulkRequest: BulkTaskRequest = { tasks: tasksData };

    this.taskService.bulkCreateTasks(bulkRequest).subscribe({
      next: (createdTasks) => {
        this.isLoading = false;
        this.successMessage = `Successfully created ${createdTasks.length} task(s).`;
        this.operationResults = {
          successful: createdTasks.length,
          failed: tasksData.length - createdTasks.length,
          errors: []
        };
        this.tasksCreated.emit(createdTasks);
        this.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to create some tasks. Please check your data and try again.';
        this.operationResults = {
          successful: 0,
          failed: tasksData.length,
          errors: [error.message || 'Unknown error occurred']
        };
        console.error('Error creating bulk tasks:', error);
      }
    });
  }

  deleteBulkTasks(): void {
    if (this.selectedTasks.length === 0) {
      this.errorMessage = 'No tasks selected for deletion.';
      return;
    }

    if (!confirm(`Are you sure you want to delete ${this.selectedTasks.length} task(s)? This action cannot be undone.`)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const deleteRequest: BulkDeleteRequest = {
      taskIds: this.selectedTasks.map(task => task.id)
    };

    this.taskService.bulkDeleteTasks(deleteRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `Successfully deleted ${this.selectedTasks.length} task(s).`;
        this.operationResults = {
          successful: this.selectedTasks.length,
          failed: 0,
          errors: []
        };
        this.tasksDeleted.emit(deleteRequest.taskIds);
        this.close.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to delete some tasks. Please try again.';
        this.operationResults = {
          successful: 0,
          failed: this.selectedTasks.length,
          errors: [error.message || 'Unknown error occurred']
        };
        console.error('Error deleting bulk tasks:', error);
      }
    });
  }

  // CSV Import/Export
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file && file.type === 'text/csv') {
      this.csvFile = file;
      this.parseCsvFile(file);
    } else {
      this.errorMessage = 'Please select a valid CSV file.';
    }
  }

  private parseCsvFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      this.csvPreview = this.parseCsv(csv);
      this.showCsvPreview = true;
      
      if (this.csvPreview.length > 1) {
        this.convertCsvToTasks();
      }
    };
    reader.readAsText(file);
  }

  private parseCsv(csv: string): string[][] {
    const lines = csv.split('\n');
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    }).filter(row => row.some(cell => cell.length > 0));
  }

  private convertCsvToTasks(): void {
    if (this.csvPreview.length < 2) return;

    const headers = this.csvPreview[0];
    const titleIndex = headers.findIndex(h => h.toLowerCase().includes('title'));
    const descriptionIndex = headers.findIndex(h => h.toLowerCase().includes('description'));
    const priorityIndex = headers.findIndex(h => h.toLowerCase().includes('priority'));
    const assigneeIndex = headers.findIndex(h => h.toLowerCase().includes('assignee') || h.toLowerCase().includes('email'));
    const dueDateIndex = headers.findIndex(h => h.toLowerCase().includes('due') || h.toLowerCase().includes('date'));
    const tagsIndex = headers.findIndex(h => h.toLowerCase().includes('tag'));
    const hoursIndex = headers.findIndex(h => h.toLowerCase().includes('hour') || h.toLowerCase().includes('estimate'));

    this.csvData = this.csvPreview.slice(1).map(row => {
      const assigneeEmail = assigneeIndex >= 0 ? row[assigneeIndex] : '';
      const assignee = this.availableUsers.find(u => u.email === assigneeEmail);
      
      return {
        title: titleIndex >= 0 ? row[titleIndex] : '',
        description: descriptionIndex >= 0 ? row[descriptionIndex] : '',
        priority: this.parsePriority(priorityIndex >= 0 ? row[priorityIndex] : ''),
        assigneeId: assignee ? assignee.id : undefined,
        due_date: dueDateIndex >= 0 ? this.parseDate(row[dueDateIndex]) : undefined,
        tags: tagsIndex >= 0 ? row[tagsIndex].split(',').map(t => t.trim()).filter(t => t) : [],
        estimated_hours: hoursIndex >= 0 ? this.parseNumber(row[hoursIndex]) : undefined
      };
    }).filter(task => task.title.trim());
  }

  private parsePriority(value: string): TaskPriority {
    const upperValue = value.toUpperCase();
    if (Object.values(TaskPriority).includes(upperValue as TaskPriority)) {
      return upperValue as TaskPriority;
    }
    return TaskPriority.MEDIUM;
  }

  private parseDate(value: string): string | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
  }

  private parseNumber(value: string): number | undefined {
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }

  importFromCsv(): void {
    if (this.csvData.length === 0) {
      this.errorMessage = 'No valid tasks found in CSV file.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const tasksData: CreateTaskRequest[] = this.csvData.map(task => ({
      ...task,
      project_id: this.projectId
    }));

    const bulkRequest: BulkTaskRequest = { tasks: tasksData };

    this.taskService.bulkCreateTasks(bulkRequest).subscribe({
      next: (createdTasks) => {
        this.isLoading = false;
        this.successMessage = `Successfully imported ${createdTasks.length} task(s) from CSV.`;
        this.operationResults = {
          successful: createdTasks.length,
          failed: tasksData.length - createdTasks.length,
          errors: []
        };
        this.tasksCreated.emit(createdTasks);
        this.resetCsvImport();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to import some tasks from CSV. Please check your data and try again.';
        this.operationResults = {
          successful: 0,
          failed: tasksData.length,
          errors: [error.message || 'Unknown error occurred']
        };
        console.error('Error importing CSV tasks:', error);
      }
    });
  }

  downloadCsvTemplate(): void {
    const csvContent = this.csvTemplate.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'task_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportTasksToCsv(): void {
    if (this.selectedTasks.length === 0) {
      this.errorMessage = 'No tasks selected for export.';
      return;
    }

    const headers = ['Title', 'Description', 'Status', 'Priority', 'Assignee', 'Due Date', 'Created Date', 'Tags'];
    const rows = this.selectedTasks.map(task => [
      task.title,
      task.description,
      task.status,
      task.priority,
      task.assigned_to ? `${task.assigned_to.name} (${task.assigned_to.email})` : '',
      task.due_date || '',
      task.created_at,
      task.tags ? task.tags.join(', ') : ''
    ]);

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    this.successMessage = `Exported ${this.selectedTasks.length} task(s) to CSV.`;
  }

  // Utility methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  private resetForm(): void {
    this.bulkForm.reset();
    this.tasksFormArray.clear();
    this.addTaskRow();
    this.addTaskRow();
    this.addTaskRow();
  }

  private resetCsvImport(): void {
    this.csvFile = null;
    this.csvData = [];
    this.csvPreview = [];
    this.showCsvPreview = false;
  }

  // Event handlers
  onModeChange(newMode: 'create' | 'delete' | 'import' | 'export'): void {
    this.mode = newMode;
    this.errorMessage = null;
    this.successMessage = null;
    this.operationResults = { successful: 0, failed: 0, errors: [] };
  }

  onCancel(): void {
    this.close.emit();
  }

  getSelectedTasksCount(): number {
    return this.selectedTasks.length;
  }

  hasOperationResults(): boolean {
    return this.operationResults.successful > 0 || this.operationResults.failed > 0;
  }
}