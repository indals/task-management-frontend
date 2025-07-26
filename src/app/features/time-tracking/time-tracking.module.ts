// src/app/features/time-tracking/time-tracking.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { TimeTrackingComponent } from './time-tracking.component';

const routes = [
  {
    path: '',
    component: TimeTrackingComponent
  }
];

@NgModule({
  declarations: [
    TimeTrackingComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class TimeTrackingModule { }