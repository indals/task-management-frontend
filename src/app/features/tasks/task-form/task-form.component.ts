import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
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
  users: User[] = [];
  submitted = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.task;
    this.initForm();
    this.loadCurrentUser();
    this.loadUsers(); // Fetch all users

    if (this.isEditMode && this.task) {
      this.populateForm();
    }
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe(
        (users) => {
            this.users = users;
        },
        (error) => {
            console.error('Error fetching users:', error);
        }
    );
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
      title: ['', Validators.required],
      description: [''],
      dueDate: [null],
      priority: ['Medium'],
      status: ['New'],
      assigneeId: [null], // Store only the assignee's ID
      subtasks: this.fb.array([])
    });
  }

  loadCurrentUser(): void {
    const currentUser = this.authService.getCurrentUser(); // Assuming synchronous method
    if (currentUser) {
      // this.users = [currentUser];
      this.taskForm.patchValue({ assigneeId: currentUser.id }); // Use assigneeId field
    } else {
      console.warn('No current user found.');
    }
  }

  populateForm(): void {
    if (!this.task) return;

    // Fix the due_date and dueDate handling
    const dueDateValue = this.task.due_date || this.task.dueDate || null;

    this.taskForm.patchValue({
      id: this.task.id,
      title: this.task.title,
      description: this.task.description,
      dueDate: this.formatDateForInput(dueDateValue),
      priority: this.task.priority,
      status: this.task.status,
      assigneeId: this.task.assigned_to?.id || this.task.assignee?.id || null
    });

    // Set entire subtasks array properly
    this.taskForm.setControl('subtasks', this.fb.array(
      this.task.subtasks?.map((subtask: { id: any; title: any; completed: any; }) => this.fb.group({
        id: [subtask.id || null],
        title: [subtask.title, Validators.required],
        completed: [subtask.completed]
      })) || []
    ));
  }

  formatDateForInput(date: Date | string | null): string {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 16); // Correct timezone handling
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

    if (this.taskForm.invalid) return;

    let taskData = this.taskForm.value;

    // Convert `dueDate` to a proper Date object
    if (taskData.dueDate) {
      taskData.dueDate = new Date(taskData.dueDate);
    }

    // Ensure `assignee` stores only the ID
    taskData.assigneeId = taskData.assigneeId ? Number(taskData.assigneeId) : null;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    taskData.user_id = user.id;
    if (this.isEditMode) {
      this.taskService.updateTask(taskData.id, taskData).subscribe({
        next: (updatedTask) => this.formSubmit.emit(updatedTask),
        error: (error) => console.error('Error updating task:', error)
      });
    } else {
      this.taskService.createTask(taskData).subscribe({
        next: (newTask) => this.formSubmit.emit(newTask),
        error: (error) => console.error('Error creating task:', error)
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}