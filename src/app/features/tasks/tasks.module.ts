import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TasksRoutingModule } from './tasks-routing.module';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { TaskFormComponent } from './task-form/task-form.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    TaskListComponent,
    TaskDetailsComponent,
    TaskFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TasksRoutingModule,
    SharedModule
  ],
  exports: [
    TaskListComponent,
    TaskDetailsComponent,
    TaskFormComponent
  ]
})
export class TasksModule { }