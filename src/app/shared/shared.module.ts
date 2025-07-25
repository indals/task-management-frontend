// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Components
import {
  HeaderComponent,
  SidebarComponent,
  // LoadingComponent,
  ConfirmationDialogComponent
} from './components';

// Pipes
import { StatusColorPipe } from './pipes';

// Directives  
import { ClickOutsideDirective } from './directives';

// Common Angular modules that features might need
const ANGULAR_MODULES = [
  CommonModule,
  RouterModule,
  HttpClientModule,
  FormsModule,
  ReactiveFormsModule
];

// Shared components, pipes, and directives
const SHARED_COMPONENTS = [
  HeaderComponent,
  SidebarComponent,
  // LoadingComponent,
  StatusColorPipe,
  ClickOutsideDirective
];

// Standalone components (not declared here)
const STANDALONE_COMPONENTS = [
  ConfirmationDialogComponent
];

@NgModule({
  declarations: [
    ...SHARED_COMPONENTS
  ],
  imports: [
    ...ANGULAR_MODULES
  ],
  exports: [
    // Re-export Angular modules for feature modules
    ...ANGULAR_MODULES,
    // Export our shared components
    ...SHARED_COMPONENTS
  ]
})
export class SharedModule {
  // Expose standalone components for import
  static readonly standaloneComponents = {
    ConfirmationDialogComponent
  };
}