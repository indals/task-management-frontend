import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TasksRoutingModule } from './tasks-routing.module';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { TaskFormComponent } from './task-form/task-form.component';

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
    TasksRoutingModule
  ],
  exports: [
    TaskListComponent,
    TaskDetailsComponent,
    TaskFormComponent
  ]
})
export class TasksModule { }