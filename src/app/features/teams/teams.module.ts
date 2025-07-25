// src/app/features/teams/teams.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { TeamsRoutingModule } from './teams-routing.module';

// Components
import { TeamListComponent } from './team-list/team-list.component';
import { TeamDetailComponent } from './team-detail/team-detail.component';
import { TeamFormComponent } from './team-form/team-form.component';
import { TeamMembersComponent } from './team-members/team-members.component';
import { TeamInvitationsComponent } from './team-invitations/team-invitations.component';
import { InviteMemberDialogComponent } from './invite-member-dialog/invite-member-dialog.component';

@NgModule({
  declarations: [
    TeamListComponent,
    TeamDetailComponent,
    TeamFormComponent,
    TeamMembersComponent,
    TeamInvitationsComponent,
    InviteMemberDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    TeamsRoutingModule
  ],
  exports: [
    TeamListComponent,
    TeamDetailComponent,
    TeamFormComponent,
    TeamMembersComponent
  ]
})
export class TeamsModule { }