// src/app/features/projects/projects.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ProjectManagementComponent } from './project-management/project-management.component';
// Import the standalone component
import { ProjectsComponent } from './projects.component';

const routes = [
  {
    path: '',
    component: ProjectsComponent // Use the standalone component as main
  },
  {
    path: 'management',
    component: ProjectManagementComponent // Management features
  },
  {
    path: ':id',
    component: ProjectManagementComponent // Project details
  }
];

@NgModule({
  declarations: [
    ProjectManagementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    ProjectsComponent // Import the standalone component
  ]
})
export class ProjectsModule { }