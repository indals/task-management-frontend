import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AccessDeniedComponent } from './access-denied.component';

const routes = [
  { 
    path: '', 
    component: AccessDeniedComponent 
  }
];

@NgModule({
  declarations: [
    AccessDeniedComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AccessDeniedModule { }