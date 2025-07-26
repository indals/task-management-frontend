import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { TeamManagementComponent } from './team-management/team-management.component';

const routes = [
  {
    path: '',
    component: TeamManagementComponent
  }
];

@NgModule({
  declarations: [
    TeamManagementComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class TeamModule { }