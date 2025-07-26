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
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
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
        this.tasks = Array.isArray(tasks) ? tasks : [tasks];
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
    console.log('View task details:', task);
  }
}