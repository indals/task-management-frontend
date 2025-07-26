// src/app/features/analytics/analytics.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { AnalyticsOverviewComponent } from './analytics-overview/analytics-overview.component';
import { AdvancedAnalyticsComponent } from './advanced-analytics/advanced-analytics.component';

const routes = [
  {
    path: '',
    component: AnalyticsOverviewComponent
  },
  {
    path: 'advanced',
    component: AdvancedAnalyticsComponent
  }
];

@NgModule({
  declarations: [
    AnalyticsOverviewComponent,
    AdvancedAnalyticsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AnalyticsModule { }