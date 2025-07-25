import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="access-denied-container">
      <mat-card class="access-denied-card">
        <mat-card-content>
          <div class="error-icon">
            <mat-icon>block</mat-icon>
          </div>
          <h1>Access Denied</h1>
          <p class="error-message">
            You don't have permission to access this resource.
          </p>
          <p class="error-description">
            If you believe this is an error, please contact your administrator or try logging in with a different account.
          </p>
          <div class="action-buttons">
            <button mat-raised-button color="primary" (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
              Go Back
            </button>
            <button mat-raised-button routerLink="/dashboard">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
    }

    .access-denied-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .error-icon {
      margin-bottom: 1.5rem;
      
      mat-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        color: #f44336;
      }
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 2rem;
      font-weight: 500;
    }

    .error-message {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 1rem;
    }

    .error-description {
      font-size: 0.95rem;
      color: #888;
      margin-bottom: 2rem;
      line-height: 1.5;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;

      button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    @media (max-width: 600px) {
      .access-denied-container {
        padding: 1rem;
      }

      .access-denied-card {
        padding: 1.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .action-buttons {
        flex-direction: column;
        align-items: stretch;

        button {
          justify-content: center;
        }
      }
    }
  `]
})
export class AccessDeniedComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}