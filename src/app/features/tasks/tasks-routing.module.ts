import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { TaskFormComponent } from './task-form/task-form.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TaskListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'new',
    component: TaskFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit/:id',
    component: TaskFormComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    component: TaskDetailsComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }