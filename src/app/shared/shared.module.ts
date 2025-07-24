import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Layout Components
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoadingComponent } from './components/loading/loading.component';

// UI Components
import { ButtonComponent } from './components/ui/button/button.component';
import { CardComponent } from './components/ui/card/card.component';

// Pipes
import { StatusColorPipe } from './pipes/status-color.pipe';

// Directives
import { ClickOutsideDirective } from './directives/click-outside.directive';

@NgModule({
  declarations: [
    // Layout Components
    HeaderComponent,
    SidebarComponent,
    LoadingComponent,
    
    // UI Components
    ButtonComponent,
    CardComponent,
    
    // Pipes
    StatusColorPipe,
    
    // Directives
    ClickOutsideDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  exports: [
    // Layout Components
    HeaderComponent,
    SidebarComponent,
    LoadingComponent,
    
    // UI Components
    ButtonComponent,
    CardComponent,
    
    // Pipes
    StatusColorPipe,
    
    // Directives
    ClickOutsideDirective,
    
    // Angular Common Modules (re-exported for convenience)
    CommonModule,
    RouterModule
  ]
})
export class SharedModule { }