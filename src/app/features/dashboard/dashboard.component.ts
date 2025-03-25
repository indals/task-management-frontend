import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';

// Register Chart.js components
Chart.register(...registerables);

interface TaskStat {
  label: string;
  value: number;
  iconClass: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isLoading = false;
  
  // Static Data
  tasks = [
    { id: 1, title: 'Task 1', status: 'In Progress', priority: 'High', dueDate: '2025-03-30' },
    { id: 2, title: 'Task 2', status: 'Completed', priority: 'Medium', dueDate: '2025-03-25' },
    { id: 3, title: 'Task 3', status: 'New', priority: 'Low', dueDate: '2025-04-01' },
    { id: 4, title: 'Task 4', status: 'On Hold', priority: 'Urgent', dueDate: '2025-03-28' }
  ];
  
  taskStats: TaskStat[] = [];
  tasksDueSoon: any[] = [];
  recentActivities = [
    { action: 'Created a new task', timestamp: '2025-03-22', icon: 'fas fa-plus-circle', description: 'You added a new task.' },
    { action: 'Completed a task', timestamp: '2025-03-21', icon: 'fas fa-check-circle', description: 'You completed a task.' }
  ];
  
  unreadNotifications = 3;
  
  // Charts
  statusChart: Chart | null = null;
  priorityChart: Chart | null = null;
  currentUser: any;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser(); // Fetch user from AuthService
    this.calculateTaskStats();
    this.filterTasksDueSoon();
    this.initCharts();
  }

  ngOnDestroy(): void {
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    if (this.priorityChart) {
      this.priorityChart.destroy();
    }
  }

  calculateTaskStats(): void {
    const total = this.tasks.length;
    const completed = this.tasks.filter(task => task.status === 'Completed').length;
    const inProgress = this.tasks.filter(task => task.status === 'In Progress').length;
    const overdue = this.tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && task.status !== 'Completed';
    }).length;

    this.taskStats = [
      { label: 'Total Tasks', value: total, iconClass: 'fas fa-tasks' },
      { label: 'In Progress', value: inProgress, iconClass: 'fas fa-spinner' },
      { label: 'Completed', value: completed, iconClass: 'fas fa-check-circle' },
      { label: 'Overdue', value: overdue, iconClass: 'fas fa-exclamation-circle' }
    ];
  }

  filterTasksDueSoon(): void {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    this.tasksDueSoon = this.tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= nextWeek && task.status !== 'Completed';
    }).slice(0, 5);
  }

  initCharts(): void {
    setTimeout(() => {
      this.initStatusChart();
      this.initPriorityChart();
    }, 0);
  }
  

  initStatusChart(): void {
    const statusCounts = { 'New': 0, 'In Progress': 0, 'On Hold': 0, 'Completed': 0 };
    this.tasks.forEach(task => {
      if (task.status in statusCounts) {
        statusCounts[task.status as keyof typeof statusCounts]++;
      }
    });

    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (ctx) {
      this.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#e3f2fd', '#fff8e1', '#f3e5f5', '#e8f5e9'],
            borderColor: ['#1976d2', '#ff8f00', '#7b1fa2', '#388e3c'],
            borderWidth: 1
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  initPriorityChart(): void {
    const priorityCounts = { 'Low': 0, 'Medium': 0, 'High': 0, 'Urgent': 0 };
    this.tasks.forEach(task => {
      if (task.priority in priorityCounts) {
        priorityCounts[task.priority as keyof typeof priorityCounts]++;
      }
    });

    const ctx = document.getElementById('priorityChart') as HTMLCanvasElement;
    if (ctx) {
      this.priorityChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(priorityCounts),
          datasets: [{
            data: Object.values(priorityCounts),
            backgroundColor: ['#e8f5e9', '#fff8e1', '#ffebee', '#d50000'],
            borderColor: ['#388e3c', '#ff8f00', '#d32f2f', '#b71c1c'],
            borderWidth: 1
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }

  navigateToTask(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  createNewTask(): void {
    this.router.navigate(['/tasks/new']);
  }

  viewAllTasks(): void {
    this.router.navigate(['/tasks']);
  }
}
