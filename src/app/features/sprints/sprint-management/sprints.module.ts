import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { Component } from '@angular/core';

@Component({
  template: `
    <div class="container">
      <h1>Sprints</h1>
      <p>Sprints feature coming soon...</p>
    </div>
  `
})
export class SprintsPlaceholderComponent {}

const routes = [
  {
    path: '',
    component: SprintsPlaceholderComponent
  }
];

@NgModule({
  declarations: [
    SprintsPlaceholderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SprintsModule { }