// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Router } from '@angular/router';
// import { Chart, registerables } from 'chart.js';
// import { Subscription } from 'rxjs';
// import { Task } from '../../../core/models/task.model';
// import { TaskService } from '../../../core/services/task.service';

// // Register Chart.js components
// Chart.register(...registerables);

// interface TaskStat {
//   label: string;
//   value: number;
//   iconClass: string;
// }

// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.scss']
// })
// export class DashboardComponent implements OnInit, OnDestroy {
//   tasks: Task[] = [];
//   taskStats: TaskStat[] = [];
//   tasksDueSoon: Task[] = [];
//   recentTasks: Task[] = [];
//   loading = true;
//   error: string | null = null;
  
//   // Charts
//   statusChart: Chart | null = null;
//   priorityChart: Chart | null = null;
  
//   private subscriptions: Subscription = new Subscription();

//   constructor(
//     private taskService: TaskService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.loadDashboardData();
//   }

//   ngOnDestroy(): void {
//     // Clean up chart instances
//     if (this.statusChart) {
//       this.statusChart.destroy();
//     }
//     if (this.priorityChart) {
//       this.priorityChart.destroy();
//     }
    
//     // Unsubscribe from all subscriptions
//     this.subscriptions.unsubscribe();
//   }

//   loadDashboardData(): void {
//     const tasksSub = this.taskService.getAllTasks().subscribe({
//       next: (tasks) => {
//         this.tasks = tasks;
//         this.calculateTaskStats();
//         this.filterTasksDueSoon();
//         this.filterRecentTasks();
//         this.initCharts();
//         this.loading = false;
//       },
//       error: (error) => {
//         this.error = 'Failed to load dashboard data: ' + (error?.message || 'Unknown error');
//         this.loading = false;
//       }
//     });
    
//     this.subscriptions.add(tasksSub);
//   }

//   calculateTaskStats(): void {
//     const total = this.tasks.length;
//     const completed = this.tasks.filter(task => task.status === 'Completed').length;
//     const inProgress = this.tasks.filter(task => task.status === 'In Progress').length;
//     const overdue = this.tasks.filter(task => {
//       if (!task.dueDate) return false;
//       const dueDate = new Date(task.dueDate);
//       return dueDate < new Date() && task.status !== 'Completed';
//     }).length;
    
//     this.taskStats = [
//       { label: 'Total Tasks', value: total, iconClass: 'fas fa-tasks' },
//       { label: 'In Progress', value: inProgress, iconClass: 'fas fa-spinner' },
//       { label: 'Completed', value: completed, iconClass: 'fas fa-check-circle' },
//       { label: 'Overdue', value: overdue, iconClass: 'fas fa-exclamation-circle' }
//     ];
//   }

//   filterTasksDueSoon(): void {
//     const today = new Date();
//     const nextWeek = new Date();
//     nextWeek.setDate(today.getDate() + 7);
    
//     this.tasksDueSoon = this.tasks
//       .filter(task => {
//         if (!task.dueDate) return false;
//         const dueDate = new Date(task.dueDate);
//         return dueDate >= today && dueDate <= nextWeek && task.status !== 'Completed';
//       })
//       .sort((a, b) => {
//         const dateA = new Date(a.dueDate || '');
//         const dateB = new Date(b.dueDate || '');
//         return dateA.getTime() - dateB.getTime();
//       })
//       .slice(0, 5); // Get top 5 tasks due soon
//   }

//   filterRecentTasks(): void {
//     // Sort by updatedAt (or createdAt if no updatedAt) and get most recent 5
//     this.recentTasks = [...this.tasks]
//       .sort((a, b) => {
//         const dateA = new Date(a.updatedAt || a.createdAt || '');
//         const dateB = new Date(b.updatedAt || b.createdAt || '');
//         return dateB.getTime() - dateA.getTime();
//       })
//       .slice(0, 5);
//   }

//   initCharts(): void {
//     this.initStatusChart();
//     this.initPriorityChart();
//   }

//   initStatusChart(): void {
//     const statusCounts = {
//       'New': 0,
//       'In Progress': 0,
//       'On Hold': 0,
//       'Completed': 0
//     };
    
//     // Count tasks by status
//     this.tasks.forEach(task => {
//       if (task.status && statusCounts.hasOwnProperty(task.status)) {
//         statusCounts[task.status as keyof typeof statusCounts]++;
//       }
//     });
    
//     const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
//     if (ctx) {
//       this.statusChart = new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//           labels: Object.keys(statusCounts),
//           datasets: [{
//             data: Object.values(statusCounts),
//             backgroundColor: [
//               '#e3f2fd', // New
//               '#fff8e1', // In Progress
//               '#f3e5f5', // On Hold
//               '#e8f5e9'  // Completed
//             ],
//             borderColor: [
//               '#1976d2', // New
//               '#ff8f00', // In Progress
//               '#7b1fa2', // On Hold
//               '#388e3c'  // Completed
//             ],
//             borderWidth: 1
//           }]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               position: 'right'
//             }
//           }
//         }
//       });
//     }
//   }

//   initPriorityChart(): void {
//     const priorityCounts = {
//       'Low': 0,
//       'Medium': 0,
//       'High': 0,
//       'Urgent': 0
//     };
    
//     // Count tasks by priority
//     this.tasks.forEach(task => {
//       if (task.priority && priorityCounts.hasOwnProperty(task.priority)) {
//         priorityCounts[task.priority as keyof typeof priorityCounts]++;
//       }
//     });
    
//     const ctx = document.getElementById('priorityChart') as HTMLCanvasElement;
//     if (ctx) {
//       this.priorityChart = new Chart(ctx, {
//         type: 'pie',
//         data: {
//           labels: Object.keys(priorityCounts),
//           datasets: [{
//             data: Object.values(priorityCounts),
//             backgroundColor: [
//               '#e8f5e9', // Low
//               '#fff8e1', // Medium
//               '#ffebee', // High
//               '#d50000'  // Urgent
//             ],
//             borderColor: [
//               '#388e3c', // Low
//               '#ff8f00', // Medium
//               '#d32f2f', // High
//               '#b71c1c'  // Urgent
//             ],
//             borderWidth: 1
//           }]
//         },
//         options: {
//           responsive: true,
//           maintainAspectRatio: false,
//           plugins: {
//             legend: {
//               position: 'right'
//             }
//           }
//         }
//       });
//     }
//   }

//   navigateToTask(taskId: number): void {
//     this.router.navigate(['/tasks', taskId]);
//   }

//   createNewTask(): void {
//     this.router.navigate(['/tasks/new']);
//   }

//   viewAllTasks(): void {
//     this.router.navigate(['/tasks']);
//   }
// }