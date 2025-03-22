// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoadingComponent } from './components/loading/loading.component';
import { StatusColorPipe } from './pipes/status-color.pipe';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    LoadingComponent,
    StatusColorPipe
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    LoadingComponent,
    StatusColorPipe
  ]
})
export class SharedModule { }