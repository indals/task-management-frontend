import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  template: `
    <div class="access-denied-container">
      <div class="access-denied-content">
        <mat-icon class="warning-icon">block</mat-icon>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <div class="actions">
          <button mat-raised-button color="primary" (click)="goBack()">
            Go Back
          </button>
          <button mat-button (click)="goHome()">
            Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      background: #f5f5f5;
    }
    .access-denied-content {
      text-align: center;
      max-width: 400px;
    }
    .warning-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #f44336;
      margin-bottom: 1rem;
    }
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
    p {
      color: #666;
      margin-bottom: 2rem;
    }
    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
  `]
})
export class AccessDeniedComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}