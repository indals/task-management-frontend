import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module'; // ← Import this

// Components
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ProfileComponent
  ],
  imports: [
    SharedModule,
    AuthRoutingModule // ← Use this instead of RouterModule.forChild
  ]
})
export class AuthModule { }