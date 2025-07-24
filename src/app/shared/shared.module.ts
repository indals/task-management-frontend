// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Import MaterialModule
import { MaterialModule } from './material.module';

// Import shared components
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoadingComponent } from './components/loading/loading.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';

// Import shared directives and pipes
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { StatusColorPipe } from './pipes/status-color.pipe';

@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    LoadingComponent,
    ConfirmationDialogComponent,
    ClickOutsideDirective,
    StatusColorPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    
    // Components
    HeaderComponent,
    SidebarComponent,
    LoadingComponent,
    ConfirmationDialogComponent,
    
    // Directives
    ClickOutsideDirective,
    
    // Pipes
    StatusColorPipe
  ]
})
export class SharedModule { }