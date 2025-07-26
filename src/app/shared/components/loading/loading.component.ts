import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loading-container" [class.overlay]="overlay">
      <div class="loading-content">
        <mat-spinner [diameter]="size" [color]="color"></mat-spinner>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;

      &.overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(2px);
        z-index: 9999;
      }
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-message {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
      text-align: center;
    }
  `]
})
export class LoadingComponent {
  @Input() showProgress: boolean = false;
  @Input() message: string = '';
  @Input() size: number = 50;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() overlay: boolean = false;
}