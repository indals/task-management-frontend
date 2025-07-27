import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { TeamManagementComponent } from './team-management/team-management.component';

const routes = [
  {
    path: '',
    component: TeamManagementComponent,
    data: { 
      title: 'Team Management',
      breadcrumb: 'Team'
    }
  }
  // TODO: Add member detail route when component is created
  // {
  //   path: 'member/:id',
  //   loadComponent: () => import('./member-detail/member-detail.component').then(c => c.MemberDetailComponent),
  //   data: { 
  //     title: 'Member Details',
  //     breadcrumb: 'Member Details'
  //   }
  // }
];

@NgModule({
  declarations: [
    TeamManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class TeamModule { }