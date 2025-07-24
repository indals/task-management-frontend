import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Core and Shared modules
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    
    // Core module with all services, guards, and interceptors
    CoreModule.forRoot(),
    
    // Shared module with common components
    SharedModule
  ],
  providers: [
    // No providers needed here - they're in CoreModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }