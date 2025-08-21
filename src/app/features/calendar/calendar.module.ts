// src/app/features/calendar/calendar.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Since CalendarComponent is standalone, we only need to define routes
const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./calendar.component').then(m => m.CalendarComponent),
    title: 'Calendar - Task Management'
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class CalendarModule { }