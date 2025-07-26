// src/app/features/reports/reports.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Import the standalone component
import { ReportsComponent } from './reports.component';

const routes = [
  {
    path: '',
    component: ReportsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    ReportsComponent // Import the standalone component
  ]
})
export class ReportsModule { }