import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    RegisterComponent,
    ProfileComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthRoutingModule
  ],
  exports: [
    RegisterComponent,
    ProfileComponent
  ]
})
export class AuthModule { }