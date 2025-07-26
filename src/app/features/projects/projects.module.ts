// src/app/features/projects/projects.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ProjectManagementComponent } from './project-management/project-management.component';

const routes = [
  {
    path: '',
    component: ProjectManagementComponent
  },
  {
    path: ':id',
    component: ProjectManagementComponent // Could be project details component
  }
];

@NgModule({
  declarations: [
    ProjectManagementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ProjectsModule { }