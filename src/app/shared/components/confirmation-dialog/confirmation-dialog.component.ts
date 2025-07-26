import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header">
        <div class="dialog-icon" [ngClass]="getIconClass()">
          <mat-icon>{{ getIcon() }}</mat-icon>
        </div>
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <button 
          mat-icon-button 
          class="close-btn" 
          (click)="onCancel()" 
          aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <div mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </div>
      
      <div mat-dialog-actions class="dialog-actions">
        <button 
          mat-button 
          (click)="onCancel()"
          class="cancel-btn">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          (click)="onConfirm()"
          [color]="getButtonColor()"
          class="confirm-btn">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      min-width: 320px;
      max-width: 500px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      padding: 1.5rem 1.5rem 0;
      position: relative;
    }

    .dialog-icon {
      margin-right: 1rem;
      padding: 0.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.warning {
        background: rgba(255, 152, 0, 0.1);
        color: #ff9800;
      }

      &.danger {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }

      &.info {
        background: rgba(33, 150, 243, 0.1);
        color: #2196f3;
      }

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    h2 {
      flex: 1;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    .close-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      color: #666;

      &:hover {
        color: #333;
      }
    }

    .dialog-content {
      padding: 1rem 1.5rem;
      
      p {
        margin: 0;
        font-size: 1rem;
        line-height: 1.5;
        color: #666;
      }
    }

    .dialog-actions {
      padding: 0 1.5rem 1.5rem;
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .cancel-btn {
      color: #666;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    }

    .confirm-btn {
      min-width: 100px;
    }

    // Dark theme support
    :host-context(.dark-theme) {
      h2 {
        color: #fff;
      }

      .dialog-content p {
        color: #ccc;
      }
    }

    @media (max-width: 600px) {
      .confirmation-dialog {
        min-width: 280px;
      }

      .dialog-header {
        padding: 1rem 1rem 0;
      }

      .dialog-content {
        padding: 0.75rem 1rem;
      }

      .dialog-actions {
        padding: 0 1rem 1rem;
        flex-direction: column-reverse;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'info':
      default:
        return 'help';
    }
  }

  getIconClass(): string {
    return this.data.type || 'info';
  }

  getButtonColor(): 'primary' | 'accent' | 'warn' {
    switch (this.data.type) {
      case 'danger':
        return 'warn';
      case 'warning':
        return 'accent';
      case 'info':
      default:
        return 'primary';
    }
  }
}