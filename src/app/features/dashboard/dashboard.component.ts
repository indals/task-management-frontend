// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Subscription } from 'rxjs';
// import { TaskService } from '../../core/services/task.service';
// import { NotificationService } from '../../core/services/notification.service';
// import { AuthService } from '../../core/services/auth.service';
// import { User } from '../../core/models/user.model';

// @Component({
//   selector: 'app-dashboard',
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.scss']
// })
// export class DashboardComponent implements OnInit, OnDestroy {
//   currentUser: User | null = null;
//   isLoading = true;
//   taskStats = {
//     total: 0,
//     completed: 0,
//     inProgress: 0,
//     pending: 0
//   };
//   recentActivities: any[] = [];
//   unreadNotifications = 0;
  
//   private subscriptions: Subscription[] = [];

//   constructor(
//     private taskService: TaskService,
//     private notificationService: NotificationService,
//     private authService: AuthService
//   ) {}

//   ngOnInit(): void {
//     this.subscriptions.push(
//       this.authService.currentUser$.subscribe(user => {
//         this.currentUser = user;
//         if (user) {
//           this.loadDashboardData();
//         }
//       })
//     );
//   }

//   ngOnDestroy(): void {
//     this.subscriptions.forEach(sub => sub.unsubscribe());
//   }

//   private loadDashboardData(): void {
//     this.isLoading = true;
    
//     // Load task statistics
//     this.subscriptions.push(
//       this.taskService.getTasksByStatus().subscribe(stats => {
//         this.taskStats = stats;
//       })
//     );
    
//     // Load recent activities
//     this.subscriptions.push(
//       this.taskService.getRecentActivities().subscribe(activities => {
//         this.recentActivities = activities;
//         this.isLoading = false;
//       })
//     );
    
//     // Load unread notifications count
//     this.subscriptions.push(
//       this.notificationService.getUnreadCount().subscribe(count => {
//         this.unreadNotifications = count;
//       })
//     );
//   }
// }