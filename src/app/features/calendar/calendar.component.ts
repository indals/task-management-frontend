// src/app/features/calendar/calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';

interface CalendarDay {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="calendar-container">
      <!-- Calendar Header -->
      <div class="calendar-header">
        <div class="header-controls">
          <button class="nav-btn" (click)="previousMonth()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          
          <h2 class="month-year">{{ currentDate | date:'MMMM yyyy' }}</h2>
          
          <button class="nav-btn" (click)="nextMonth()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
        
        <div class="header-actions">
          <button class="today-btn" (click)="goToToday()">Today</button>
          <select class="view-selector" [(ngModel)]="viewMode" (change)="onViewModeChange()">
            <option value="month">Month</option>
            <option value="week">Week</option>
          </select>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-grid" *ngIf="viewMode === 'month'">
        <!-- Day Headers -->
        <div class="day-header" *ngFor="let day of dayHeaders">
          {{ day }}
        </div>
        
        <!-- Calendar Days -->
        <div 
          class="calendar-day" 
          *ngFor="let day of calendarDays"
          [class.other-month]="!day.isCurrentMonth"
          [class.today]="day.isToday"
          [class.selected]="day.isSelected"
          [class.has-tasks]="day.tasks.length > 0"
          (click)="selectDay(day)"
        >
          <div class="day-number">{{ day.date.getDate() }}</div>
          
          <!-- Task indicators -->
          <div class="task-indicators" *ngIf="day.tasks.length > 0">
            <div 
              class="task-dot" 
              *ngFor="let task of day.tasks.slice(0, 3)"
              [class.priority-high]="task.priority === 'HIGH'"
              [class.priority-medium]="task.priority === 'MEDIUM'"
              [class.priority-low]="task.priority === 'LOW'"
              [title]="task.title"
            ></div>
            <span class="more-tasks" *ngIf="day.tasks.length > 3">+{{ day.tasks.length - 3 }}</span>
          </div>
        </div>
      </div>

      <!-- Week View -->
      <div class="week-view" *ngIf="viewMode === 'week'">
        <div class="week-header">
          <div class="time-column"></div>
          <div class="day-column" *ngFor="let day of weekDays">
            <div class="day-name">{{ day.date | date:'EEE' }}</div>
            <div class="day-date" [class.today]="day.isToday">{{ day.date | date:'d' }}</div>
          </div>
        </div>
        
        <div class="week-content">
          <div class="time-slots">
            <div class="time-slot" *ngFor="let hour of timeSlots">
              <span class="time-label">{{ hour }}:00</span>
            </div>
          </div>
          
          <div class="day-columns">
            <div class="day-column" *ngFor="let day of weekDays">
              <div class="day-tasks">
                <div 
                  class="week-task" 
                  *ngFor="let task of day.tasks"
                  [class.priority-high]="task.priority === 'HIGH'"
                  [class.priority-medium]="task.priority === 'MEDIUM'"
                  [class.priority-low]="task.priority === 'LOW'"
                  (click)="viewTaskDetails(task)"
                >
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-time" *ngIf="task.due_date">
                    {{ task.due_date | date:'shortTime' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Day Details -->
      <div class="day-details" *ngIf="selectedDay">
        <h3>{{ selectedDay.date | date:'fullDate' }}</h3>
        
        <div class="day-tasks-list" *ngIf="selectedDay.tasks.length > 0; else noTasks">
          <div 
            class="task-item" 
            *ngFor="let task of selectedDay.tasks"
            [class.completed]="task.status === 'COMPLETED'"
          >
            <div class="task-info">
              <h4>{{ task.title }}</h4>
              <p>{{ task.description }}</p>
              <div class="task-meta">
                <span class="status" [class]="'status-' + task.status.toLowerCase()">
                  {{ task.status | titlecase }}
                </span>
                <span class="priority" [class]="'priority-' + task.priority.toLowerCase()">
                  {{ task.priority | titlecase }}
                </span>
                <span class="assignee" *ngIf="task.assigned_to">
                  Assigned to: {{ task.assigned_to.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <ng-template #noTasks>
          <p class="no-tasks">No tasks scheduled for this day</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .nav-btn {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-btn:hover {
      background: #e9ecef;
    }

    .month-year {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .today-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .today-btn:hover {
      background: #0056b3;
    }

    .view-selector {
      padding: 8px 12px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      background: white;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background: #dee2e6;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .day-header {
      background: #f8f9fa;
      padding: 15px 10px;
      text-align: center;
      font-weight: 600;
      color: #666;
    }

    .calendar-day {
      background: white;
      min-height: 100px;
      padding: 8px;
      cursor: pointer;
      transition: background 0.2s;
      position: relative;
    }

    .calendar-day:hover {
      background: #f8f9fa;
    }

    .calendar-day.other-month {
      background: #f8f9fa;
      color: #999;
    }

    .calendar-day.today {
      background: #e3f2fd;
    }

    .calendar-day.selected {
      background: #bbdefb;
    }

    .calendar-day.has-tasks {
      border-left: 4px solid #007bff;
    }

    .day-number {
      font-weight: 600;
      margin-bottom: 5px;
    }

    .task-indicators {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      align-items: center;
    }

    .task-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #007bff;
    }

    .task-dot.priority-high {
      background: #dc3545;
    }

    .task-dot.priority-medium {
      background: #ffc107;
    }

    .task-dot.priority-low {
      background: #28a745;
    }

    .more-tasks {
      font-size: 10px;
      color: #666;
      margin-left: 2px;
    }

    .week-view {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .week-header {
      display: grid;
      grid-template-columns: 60px repeat(7, 1fr);
      border-bottom: 1px solid #dee2e6;
    }

    .time-column {
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
    }

    .day-column {
      padding: 15px 10px;
      text-align: center;
      border-right: 1px solid #dee2e6;
    }

    .day-column:last-child {
      border-right: none;
    }

    .day-name {
      font-weight: 600;
      color: #666;
    }

    .day-date {
      font-size: 18px;
      font-weight: 700;
      margin-top: 5px;
    }

    .day-date.today {
      color: #007bff;
    }

    .week-content {
      display: grid;
      grid-template-columns: 60px 1fr;
      min-height: 600px;
    }

    .time-slots {
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
    }

    .time-slot {
      height: 60px;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .time-label {
      font-size: 12px;
      color: #666;
    }

    .day-columns {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .day-columns .day-column {
      border-right: 1px solid #dee2e6;
      padding: 5px;
      min-height: 600px;
    }

    .week-task {
      background: #e3f2fd;
      border-left: 3px solid #007bff;
      padding: 8px;
      margin-bottom: 5px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .week-task:hover {
      background: #bbdefb;
    }

    .week-task.priority-high {
      background: #ffebee;
      border-left-color: #dc3545;
    }

    .week-task.priority-medium {
      background: #fffbf0;
      border-left-color: #ffc107;
    }

    .week-task.priority-low {
      background: #f1f8e9;
      border-left-color: #28a745;
    }

    .task-title {
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 2px;
    }

    .task-time {
      font-size: 10px;
      color: #666;
    }

    .day-details {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
    }

    .day-details h3 {
      margin: 0 0 20px 0;
      color: #333;
    }

    .task-item {
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 10px;
      transition: all 0.2s;
    }

    .task-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .task-item.completed {
      opacity: 0.7;
      text-decoration: line-through;
    }

    .task-info h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .task-info p {
      margin: 0 0 10px 0;
      color: #666;
    }

    .task-meta {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .status, .priority {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-in_progress {
      background: #d1ecf1;
      color: #0c5460;
    }

    .status-completed {
      background: #d4edda;
      color: #155724;
    }

    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .priority-high {
      background: #f8d7da;
      color: #721c24;
    }

    .priority-medium {
      background: #fff3cd;
      color: #856404;
    }

    .priority-low {
      background: #d4edda;
      color: #155724;
    }

    .assignee {
      font-size: 12px;
      color: #666;
    }

    .no-tasks {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 40px 0;
    }

    @media (max-width: 768px) {
      .calendar-header {
        flex-direction: column;
        gap: 15px;
      }

      .header-controls {
        gap: 10px;
      }

      .month-year {
        font-size: 20px;
      }

      .calendar-day {
        min-height: 80px;
        padding: 5px;
      }

      .week-view {
        display: none;
      }

      .view-selector option[value="week"] {
        display: none;
      }
    }
  `]
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;
  viewMode: 'month' | 'week' = 'month';
  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  tasks: Task[] = [];
  loading = false;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.loadTasks();
    this.generateCalendar();
  }

  loadTasks() {
    this.loading = true;
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.generateCalendar();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  generateCalendar() {
    if (this.viewMode === 'month') {
      this.generateMonthView();
    } else {
      this.generateWeekView();
    }
  }

  generateMonthView() {
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
      
      this.calendarDays.push({
        date: new Date(current),
        tasks: dayTasks,
        isCurrentMonth: current.getMonth() === month,
        isToday: this.isToday(current),
        isSelected: false
      });
      
      current.setDate(current.getDate() + 1);
    }
  }

  generateWeekView() {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    this.weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      
      const dayTasks = this.getTasksForDate(date);
      
      this.weekDays.push({
        date,
        tasks: dayTasks,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        isSelected: false
      });
    }
  }

  getTasksForDate(date: Date): Task[] {
    return this.tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === date.toDateString();
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  selectDay(day: CalendarDay) {
    this.calendarDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
    this.selectedDay = day;
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  goToToday() {
    this.currentDate = new Date();
    this.generateCalendar();
  }

  onViewModeChange() {
    this.generateCalendar();
  }

  viewTaskDetails(task: Task) {
    // Implement task details view or navigation
    console.log('View task details:', task);
  }
}