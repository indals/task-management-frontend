// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoadingComponent } from './components/loading/loading.component';
import { StatusColorPipe } from './pipes/status-color.pipe';
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    LoadingComponent,
    StatusColorPipe,
    ClickOutsideDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    LoadingComponent,
    StatusColorPipe,
    ClickOutsideDirective
  ]
})
export class SharedModule { }