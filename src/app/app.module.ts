import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent], // Declare the component
  imports: [
    BrowserModule,
    RouterModule.forRoot([]),
    HttpClientModule // Setup routing (add routes if needed)
  ],
  providers: [AuthService], // Provide services if necessary
  bootstrap: [AppComponent] // Bootstrap AppComponent
})
export class AppModule {}
