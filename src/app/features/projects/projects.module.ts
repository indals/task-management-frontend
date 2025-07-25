import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// Placeholder component
import { Component } from '@angular/core';

@Component({
  template: `
    <div class="container">
      <h1>Projects</h1>
      <p>Projects feature coming soon...</p>
    </div>
  `
})
export class ProjectsPlaceholderComponent {}

const routes = [
  {
    path: '',
    component: ProjectsPlaceholderComponent
  }
];

@NgModule({
  declarations: [
    ProjectsPlaceholderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ProjectsModule { }