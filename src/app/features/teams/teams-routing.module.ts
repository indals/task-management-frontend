// src/app/features/teams/teams-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TeamListComponent } from './team-list/team-list.component';
import { TeamDetailComponent } from './team-detail/team-detail.component';
import { TeamFormComponent } from './team-form/team-form.component';

const routes: Routes = [
  {
    path: '',
    component: TeamListComponent,
    data: { title: 'Teams' }
  },
  {
    path: 'new',
    component: TeamFormComponent,
    data: { title: 'Create Team' }
  },
  {
    path: ':id',
    component: TeamDetailComponent,
    data: { title: 'Team Details' }
  },
  {
    path: ':id/edit',
    component: TeamFormComponent,
    data: { title: 'Edit Team' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamsRoutingModule { }