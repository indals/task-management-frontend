// src/app/features/calendar/calendar.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Import the standalone component instead of declaring it
import { CalendarComponent } from './calendar.component';

const routes = [
  { path: '', component: CalendarComponent }
];

@NgModule({
  declarations: [
    // ✅ REMOVED CalendarComponent from declarations since it's standalone
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CalendarComponent // ✅ ADDED: Import the standalone component here
  ]
})
export class CalendarModule { }