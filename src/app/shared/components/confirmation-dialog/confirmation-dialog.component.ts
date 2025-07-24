import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ data.title }}</h3>
          <button class="close-btn" (click)="onCancel()" aria-label="Close">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <p>{{ data.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="onCancel()">
            {{ data.cancelText || 'Cancel' }}
          </button>
          <button class="btn btn-danger" (click)="onConfirm()">
            {{ data.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      min-width: 300px;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      padding: 1rem;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-body {
      padding: 1rem;
    }

    .modal-footer {
      padding: 1rem;
      border-top: 1px solid #e5e5e5;
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c82333;
    }
  `]
})
export class ConfirmationDialogComponent {
  constructor(@Inject('data') public data: ConfirmationDialogData) {}

  onConfirm(): void {
    // Emit confirmation event or use a service
    console.log('Confirmed');
  }

  onCancel(): void {
    // Emit cancel event or use a service
    console.log('Cancelled');
  }
}