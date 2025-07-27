import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Core Services and Models
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Task, User } from '../../core/models';

interface CalendarDay {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
  hasOverdueTasks: boolean;
  taskCount: number;
}

interface TaskCalendarEvent {
  task: Task;
  startTime?: string;
  endTime?: string;
  position?: number;
  duration?: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Calendar State
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;
  viewMode: 'month' | 'week' | 'day' = 'month';
  
  // Data
  tasks: Task[] = [];
  currentUser: User | null = null;
  
  // UI State
  loading = false;
  error: string | null = null;
  
  // Calendar Constants
  dayHeaders = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  dayHeadersShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  timeSlots = Array.from({ length: 24 }, (_, i) => i);
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter Options
  filterOptions = {
    showMyTasks: true,
    showAllTasks: false,
    showCompleted: false,
    priorities: ['HIGH', 'MEDIUM', 'LOW'],
    statuses: ['TODO', 'IN_PROGRESS', 'IN_REVIEW']
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Current user subscription
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.loadTasks(); // Reload tasks when user changes
      });
  }

  private loadInitialData(): void {
    this.loadTasks();
    this.generateCalendar();
  }

  loadTasks(): void {
    if (!this.currentUser) return;

    this.loading = true;
    this.error = null;

    // Create date range for current month/week view
    const { startDate, endDate } = this.getDateRange();
    
    const filters = {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      ...(this.filterOptions.showMyTasks ? { assigned_to_id: this.currentUser.id } : {}),
      ...(this.filterOptions.priorities.length > 0 ? { priority: this.filterOptions.priorities.join(',') } : {}),
      ...(this.filterOptions.statuses.length > 0 ? { status: this.filterOptions.statuses.join(',') } : {})
    };

    this.taskService.getTasks(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          this.tasks = response.data || [];
          this.generateCalendar();
          console.log('Calendar: Tasks loaded successfully', this.tasks.length);
        },
        error: (error) => {
          console.error('Calendar: Error loading tasks:', error);
          this.error = 'Failed to load tasks. Please try again.';
          this.tasks = [];
          this.generateCalendar();
        }
      });
  }

  private getDateRange(): { startDate: Date; endDate: Date } {
    let startDate: Date;
    let endDate: Date;

    if (this.viewMode === 'month') {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      startDate = new Date(year, month, 1);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week
      
      endDate = new Date(year, month + 1, 0);
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End of week
    } else if (this.viewMode === 'week') {
      startDate = new Date(this.currentDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    } else { // day view
      startDate = new Date(this.currentDate);
      endDate = new Date(this.currentDate);
    }

    return { startDate, endDate };
  }

  generateCalendar(): void {
    switch (this.viewMode) {
      case 'month':
        this.generateMonthView();
        break;
      case 'week':
        this.generateWeekView();
        break;
      case 'day':
        this.generateDayView();
        break;
    }
  }

  private generateMonthView(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    this.calendarDays = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayTasks = this.getTasksForDate(current);
      const overdueTasks = this.getOverdueTasksForDate(current);
      
      this.calendarDays.push({
        date: new Date(current),
        tasks: dayTasks,
        isCurrentMonth: current.getMonth() === month,
        isToday: this.isToday(current),
        isSelected: this.selectedDay?.date.toDateString() === current.toDateString(),
        isWeekend: current.getDay() === 0 || current.getDay() === 6,
        hasOverdueTasks: overdueTasks.length > 0,
        taskCount: dayTasks.length
      });
      
      current.setDate(current.getDate() + 1);
    }
  }

  private generateWeekView(): void {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    this.weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      
      const dayTasks = this.getTasksForDate(date);
      const overdueTasks = this.getOverdueTasksForDate(date);
      
      this.weekDays.push({
        date,
        tasks: dayTasks,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        isSelected: this.selectedDay?.date.toDateString() === date.toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        hasOverdueTasks: overdueTasks.length > 0,
        taskCount: dayTasks.length
      });
    }
  }

  private generateDayView(): void {
    const dayTasks = this.getTasksForDate(this.currentDate);
    const overdueTasks = this.getOverdueTasksForDate(this.currentDate);
    
    this.selectedDay = {
      date: new Date(this.currentDate),
      tasks: dayTasks,
      isCurrentMonth: true,
      isToday: this.isToday(this.currentDate),
      isSelected: true,
      isWeekend: this.currentDate.getDay() === 0 || this.currentDate.getDay() === 6,
      hasOverdueTasks: overdueTasks.length > 0,
      taskCount: dayTasks.length
    };
  }

  private getTasksForDate(date: Date): Task[] {
    return this.tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return this.isSameDate(taskDate, date);
    });
  }

  private getOverdueTasksForDate(date: Date): Task[] {
    const today = new Date();
    return this.tasks.filter(task => {
      if (!task.due_date || task.status === 'DONE') return false;
      const taskDate = new Date(task.due_date);
      return taskDate < today && this.isSameDate(taskDate, date);
    });
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDate(date, today);
  }

  // Navigation Methods
  previousPeriod(): void {
    switch (this.viewMode) {
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        break;
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        break;
    }
    this.loadTasks();
  }

  nextPeriod(): void {
    switch (this.viewMode) {
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        break;
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        break;
    }
    this.loadTasks();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.loadTasks();
  }

  onViewModeChange(): void {
    this.selectedDay = null;
    this.generateCalendar();
  }

  // Selection Methods
  selectDay(day: CalendarDay): void {
    // Clear previous selection
    this.calendarDays.forEach(d => d.isSelected = false);
    this.weekDays.forEach(d => d.isSelected = false);
    
    // Set new selection
    day.isSelected = true;
    this.selectedDay = day;
    
    console.log('Selected day:', day.date.toDateString(), 'Tasks:', day.tasks.length);
  }

  // Task Actions
  viewTaskDetails(task: Task): void {
    console.log('Viewing task details:', task.title);
    this.router.navigate(['/tasks', task.id]);
  }

  createTask(date?: Date): void {
    const taskDate = date || this.selectedDay?.date || new Date();
    this.router.navigate(['/tasks/create'], {
      queryParams: { 
        due_date: taskDate.toISOString().split('T')[0] 
      }
    });
  }

  editTask(task: Task): void {
    this.router.navigate(['/tasks', task.id, 'edit']);
  }

  // Filter Methods
  toggleFilter(filterType: string): void {
    switch (filterType) {
      case 'myTasks':
        this.filterOptions.showMyTasks = !this.filterOptions.showMyTasks;
        break;
      case 'allTasks':
        this.filterOptions.showAllTasks = !this.filterOptions.showAllTasks;
        break;
      case 'completed':
        this.filterOptions.showCompleted = !this.filterOptions.showCompleted;
        break;
    }
    this.loadTasks();
  }

  // Utility Methods
  getFormattedDate(): string {
    switch (this.viewMode) {
      case 'month':
        return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
      case 'week':
        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
      case 'day':
        return this.currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      default:
        return '';
    }
  }

  getTaskPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH': return '#f44336';
      case 'MEDIUM': return '#ff9800';
      case 'LOW': return '#4caf50';
      default: return '#757575';
    }
  }

  getTaskStatusColor(status: string): string {
    switch (status) {
      case 'TODO': return '#2196f3';
      case 'IN_PROGRESS': return '#ff9800';
      case 'IN_REVIEW': return '#9c27b0';
      case 'TESTING': return '#607d8b';
      case 'DONE': return '#4caf50';
      case 'BLOCKED': return '#f44336';
      default: return '#757575';
    }
  }

  hasTasksOnDate(date: Date): boolean {
    return this.getTasksForDate(date).length > 0;
  }

  getTasksCountForDate(date: Date): number {
    return this.getTasksForDate(date).length;
  }

  // Track by functions for performance
  trackByDay(index: number, day: CalendarDay): string {
    return day.date.toDateString();
  }

  trackByTask(index: number, task: Task): number {
    return task.id;
  }

  // Refresh data
  refreshTasks(): void {
    this.loadTasks();
  }
}