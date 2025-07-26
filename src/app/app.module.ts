import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Core and Shared modules
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

// Root component
import { AppComponent } from './app.component';

// Material Design Theme and Icons
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Angular modules
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    // Routing
    AppRoutingModule,
    
    // Application modules
    CoreModule,        // Import CoreModule ONCE here
    SharedModule       // Import SharedModule for common components/pipes/directives
  ],
  providers: [
    // Additional providers can be added here
    // Note: Core services and interceptors are provided by CoreModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    // Register custom icons if needed
    this.registerCustomIcons();
  }

  private registerCustomIcons(): void {
    // Register custom SVG icons
    // Example:
    // this.matIconRegistry.addSvgIcon(
    //   'custom-icon',
    //   this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/custom-icon.svg')
    // );
    
    // Register icon fonts
    this.matIconRegistry.setDefaultFontSetClass('material-icons-outlined');
  }
}